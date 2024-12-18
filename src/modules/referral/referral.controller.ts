import { Controller, Get, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { ReferralService } from './referral.service';
import { Request } from 'express';

@Controller('referral')
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  @Get('get')
  @HttpCode(HttpStatus.OK)
  get(@Req() req: Request) {
    return this.referralService.get(req);
  }
}
