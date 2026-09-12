import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';

import { RefreshJwtAuthGuard } from '../../common/guards/refresh-jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

import type {
  AccessTokenPayload,
  RefreshTokenPayload,
} from './types/jwt-payload.type';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @ApiBearerAuth()
  @UseGuards(RefreshJwtAuthGuard)
  @Post('refresh')
  refresh(@CurrentUser() user: RefreshTokenPayload) {
    return this.authService.refresh(user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@CurrentUser() user: AccessTokenPayload) {
    return this.authService.logout(user.sub);
  }
}
