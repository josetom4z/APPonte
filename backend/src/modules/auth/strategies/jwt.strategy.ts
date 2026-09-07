import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../../database/schemas';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'apponte_super_jwt_secret_dev_key_2026'),
    });
  }

  async validate(payload: any) {
    const user = await this.userModel.findById(payload.sub).populate('tenantId', 'name slug city state logoUrl');
    if (!user || user.status === 'BLOCKED') {
      throw new UnauthorizedException('Usuário inválido ou bloqueado.');
    }
    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId ? (user.tenantId as any)._id?.toString() || user.tenantId.toString() : null,
      tenant: user.tenantId,
      departmentId: user.departmentId ? user.departmentId.toString() : null,
      avatarUrl: user.avatarUrl,
    };
  }
}
