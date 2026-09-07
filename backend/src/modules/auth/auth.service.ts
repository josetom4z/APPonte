import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument, Tenant, TenantDocument } from '../../database/schemas';
import { RegisterDto, LoginDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto } from './dto/auth.dto';
import { Role } from '../../common/enums';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userModel.findOne({ email: dto.email.toLowerCase() });
    if (existing) {
      throw new ConflictException('Este endereço de e-mail já está cadastrado.');
    }

    let tenantObjectId: Types.ObjectId | undefined;
    if (dto.tenantId) {
      const tenant = await this.tenantModel.findById(dto.tenantId);
      if (tenant) {
        tenantObjectId = tenant._id as Types.ObjectId;
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const user = new this.userModel({
      name: dto.name,
      email: dto.email.toLowerCase(),
      passwordHash,
      phone: dto.phone,
      tenantId: tenantObjectId,
      role: dto.role || Role.CITIZEN,
      status: 'ACTIVE',
      isEmailVerified: true,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(dto.name)}`,
    });

    await user.save();

    const tokens = await this.generateTokens(user);
    await this.saveRefreshToken(user._id.toString(), tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userModel
      .findOne({ email: dto.email.toLowerCase() })
      .select('+passwordHash +refreshTokens')
      .populate('tenantId', 'name slug city state logoUrl');

    if (!user) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    if (user.status === 'BLOCKED') {
      throw new UnauthorizedException('Sua conta foi suspensa. Entre em contato com o suporte.');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    const tokens = await this.generateTokens(user);
    await this.saveRefreshToken(user._id.toString(), tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify(dto.refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET', 'apponte_super_refresh_jwt_dev_key_2026'),
      });

      const user = await this.userModel
        .findById(payload.sub)
        .select('+refreshTokens')
        .populate('tenantId', 'name slug city state logoUrl');

      if (!user || !user.refreshTokens.includes(dto.refreshToken)) {
        throw new UnauthorizedException('Refresh Token inválido ou revogado.');
      }

      // Rotate token: remove used token and issue a new pair
      const tokens = await this.generateTokens(user);
      user.refreshTokens = user.refreshTokens.filter((t) => t !== dto.refreshToken);
      user.refreshTokens.push(tokens.refreshToken);
      if (user.refreshTokens.length > 5) {
        user.refreshTokens.shift();
      }
      await user.save();

      return {
        user: this.sanitizeUser(user),
        ...tokens,
      };
    } catch (err) {
      throw new UnauthorizedException('Sessão expirada. Faça login novamente.');
    }
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.userModel.updateOne(
        { _id: userId },
        { $pull: { refreshTokens: refreshToken } },
      );
    }
    return { message: 'Logout realizado com sucesso.' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userModel.findOne({ email: dto.email.toLowerCase() });
    if (!user) {
      // Don't reveal account existence for security
      return { message: 'Se o e-mail existir no sistema, você receberá instruções de recuperação.' };
    }

    const token = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    return {
      message: 'Instruções de recuperação geradas com sucesso.',
      resetToken: token, // Returned for dev/testing ease
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.userModel.findOne({
      resetPasswordToken: dto.token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestException('Token de recuperação expirado ou inválido.');
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(dto.newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.refreshTokens = [];
    await user.save();

    return { message: 'Senha redefinida com sucesso. Faça login com a nova senha.' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userModel.findById(userId).select('+passwordHash');
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const isMatch = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestException('A senha atual informada está incorreta.');
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(dto.newPassword, salt);
    await user.save();

    return { message: 'Senha alterada com sucesso.' };
  }

  async getMe(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .populate('tenantId', 'name slug city state logoUrl bannerUrl')
      .populate('departmentId', 'name slug icon');

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return this.sanitizeUser(user);
  }

  private async generateTokens(user: any) {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      tenantId: user.tenantId ? (user.tenantId._id || user.tenantId).toString() : null,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET', 'apponte_super_jwt_secret_dev_key_2026'),
        expiresIn: (this.configService.get<string>('JWT_EXPIRATION', '15m') as any),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET', 'apponte_super_refresh_jwt_dev_key_2026'),
        expiresIn: (this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d') as any),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(userId: string, refreshToken: string) {
    await this.userModel.updateOne(
      { _id: userId },
      {
        $push: {
          refreshTokens: {
            $each: [refreshToken],
            $slice: -5, // Keep at most 5 active sessions
          },
        },
      },
    );
  }

  private sanitizeUser(user: any) {
    const obj = user.toObject ? user.toObject() : { ...user };
    delete obj.passwordHash;
    delete obj.refreshTokens;
    delete obj.resetPasswordToken;
    delete obj.resetPasswordExpires;
    return obj;
  }
}
