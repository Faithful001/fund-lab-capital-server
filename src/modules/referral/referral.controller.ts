import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ReferralService } from './referral.service';

@Controller('referral')
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  @Get('get')
  @HttpCode(HttpStatus.OK)
  get() {
    return this.referralService.get();
  }
}
