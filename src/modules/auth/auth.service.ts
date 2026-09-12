import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { LoginDto, RegisterDto } from './dto';
import { UsersService } from '../users/users.service';

import type {
  AccessTokenPayload,
  RefreshTokenPayload,
} from './types/jwt-payload.type';

import { Role } from 'src/common/enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Generate access and refresh tokens
   */
  private async signTokens(payload: AccessTokenPayload) {
    const accessTtl = this.configService.get<string>('jwt.accessTtl') ?? '15m';

    const refreshTtl = this.configService.get<string>('jwt.refreshTtl') ?? '7d';

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('jwt.secret') ?? '',
      expiresIn: accessTtl as never,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret') ?? '',
      expiresIn: refreshTtl as never,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Build authentication response
   */
  private async buildAuthResponse(userId: string, email: string, role: Role) {
    const payload: AccessTokenPayload = {
      sub: userId,
      email,
      role,
    };

    const tokens = await this.signTokens(payload);

    const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 12);

    await this.usersService.updateRefreshTokenHash(userId, refreshTokenHash);

    return {
      userId,
      email,
      role,
      ...tokens,
    };
  }

  /**
   * Register a new user
   */
  async register(dto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.usersService.create({
      ...dto,
      passwordHash,
    });

    return this.buildAuthResponse(user.id, user.email, user.role as Role);
  }

  /**
   * Login existing user
   */
  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildAuthResponse(user.id, user.email, user.role as Role);
  }

  /**
   * Refresh access and refresh tokens
   */
  async refresh(user: RefreshTokenPayload) {
    const currentUser = await this.usersService.findById(user.sub);

    if (!currentUser?.refreshTokenHash) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    const tokenMatches = await bcrypt.compare(
      user.refreshToken,
      currentUser.refreshTokenHash,
    );

    if (!tokenMatches) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    const payload: AccessTokenPayload = {
      sub: currentUser.id,
      email: currentUser.email,
      role: currentUser.role as Role,
    };

    const tokens = await this.signTokens(payload);

    const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 12);

    await this.usersService.updateRefreshTokenHash(
      currentUser.id,
      refreshTokenHash,
    );

    return {
      userId: currentUser.id,
      email: currentUser.email,
      role: currentUser.role as Role,
      ...tokens,
    };
  }

  /**
   * Logout user
   */
  async logout(userId: string) {
    await this.usersService.updateRefreshTokenHash(userId, null);

    return {
      success: true,
      message: 'Logged out successfully',
    };
  }
}
