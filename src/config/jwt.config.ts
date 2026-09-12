import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET ?? '',
  refreshSecret: process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET ?? '',
  accessTtl: process.env.JWT_ACCESS_TOKEN_TTL ?? '15m',
  refreshTtl: process.env.JWT_REFRESH_TOKEN_TTL ?? '7d',
}));
