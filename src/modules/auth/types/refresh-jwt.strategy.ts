import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { RefreshTokenPayload } from './jwt-payload.type';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.refreshSecret') ?? '',
      passReqToCallback: true,
    });
  }

  validate(request: Request, payload: RefreshTokenPayload) {
    const authorization = request.headers['authorization'] ?? '';
    const refreshToken = authorization.toString().startsWith('Bearer ')
      ? authorization.toString().slice('Bearer '.length)
      : '';

    return {
      ...payload,
      refreshToken,
    };
  }
}
