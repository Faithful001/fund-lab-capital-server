import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReferralService } from './referral.service';
import { Request } from 'express';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { AuthGuard } from 'src/guards/auth.guard';

@Roles(Role.USER, Role.ADMIN)
@UseGuards(AuthGuard)
@Controller('referral')
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  @Get('get')
  @HttpCode(HttpStatus.OK)
  get(@Req() req: Request) {
    return this.referralService.get(req);
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard)
  @Get('get-all')
  @HttpCode(HttpStatus.OK)
  getAll() {
    return this.referralService.getAll();
  }
}
