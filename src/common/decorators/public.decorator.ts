import { SetMetadata } from '@nestjs/common';
import { PUBLIC_KEY } from '../constants/metadata.constants';

export const Public = () => SetMetadata(PUBLIC_KEY, true);
