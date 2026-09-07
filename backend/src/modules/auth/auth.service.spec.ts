import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User, Tenant } from '../../database/schemas';
import { Role } from '../../common/enums';

describe('AuthService', () => {
  let service: AuthService;
  let mockUserModel: any;
  let mockTenantModel: any;
  let mockJwtService: any;
  let mockConfigService: any;

  beforeEach(async () => {
    mockUserModel = jest.fn().mockImplementation((dto) => ({
      ...dto,
      _id: 'user_123',
      save: jest.fn().mockResolvedValue(true),
      toObject: jest.fn().mockReturnValue({ _id: 'user_123', ...dto }),
    }));
    mockUserModel.findOne = jest.fn();
    mockUserModel.findById = jest.fn();
    mockUserModel.updateOne = jest.fn();

    mockTenantModel = {
      findById: jest.fn(),
    };

    mockJwtService = {
      signAsync: jest.fn().mockResolvedValue('mocked_jwt_token'),
      verify: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn().mockReturnValue('mock_secret'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken(User.name), useValue: mockUserModel },
        { provide: getModelToken(Tenant.name), useValue: mockTenantModel },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should register a new citizen successfully', async () => {
    mockUserModel.findOne.mockResolvedValue(null);

    const result = await service.register({
      name: 'João Silva',
      email: 'joao@teste.com',
      password: 'password123',
      role: Role.CITIZEN,
    });

    expect(result).toHaveProperty('user');
    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
    expect(result.user.email).toBe('joao@teste.com');
  });

  it('should throw ConflictException if email already registered', async () => {
    mockUserModel.findOne.mockResolvedValue({ _id: 'existing_user' });

    await expect(
      service.register({
        name: 'João Silva',
        email: 'joao@teste.com',
        password: 'password123',
      }),
    ).rejects.toThrow(ConflictException);
  });
});
