import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UsersService, sanitizeUser } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async me(@CurrentUser() user: { sub: string }) {
    const found = await this.usersService.findById(user.sub);
    return found ? sanitizeUser(found) : null;
  }

  @Patch('me')
  async updateMe(
    @CurrentUser() user: { sub: string },
    @Body() body: UpdateUserDto,
  ) {
    const updated = await this.usersService.updateProfile(user.sub, body);
    return sanitizeUser(updated);
  }
}
