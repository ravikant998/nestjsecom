import { Role } from '../../../common/enums/role.enum';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: Role;
}

export interface RefreshTokenPayload extends AccessTokenPayload {
  refreshToken: string;
}
