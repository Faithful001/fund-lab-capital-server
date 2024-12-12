import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('get/:id')
  @HttpCode(HttpStatus.OK)
  get(@Param('id') id?: string) {
    return this.walletService.get(id);
  }

  @Get('get-by-name/:name')
  @HttpCode(HttpStatus.OK)
  getByName(@Req() req: Request, @Param('name') name: string) {
    return this.walletService.getByName(req, name);
  }

  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  delete(@Param('id') id: string) {
    return this.walletService.delete(id);
  }

  @HttpCode(HttpStatus.OK)
  @Post('deposit')
  @UseInterceptors(FileInterceptor('image'))
  async deposit(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
    @Body('amount') amount: string,
    @Body('gateway_name') gateway_name: string,
    @Body('fee') fee?: number,
  ) {
    return await this.walletService.deposit(
      req,
      file,
      amount,
      gateway_name,
      fee,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('withdraw')
  async withdraw(
    @Req() req: Request,
    @Body('amount') amount: number,
    @Body('wallet_name') wallet_name: string,
    @Body('user_wallet_address') user_wallet_address: string,
  ) {
    return await this.walletService.withdraw(
      req,
      amount,
      wallet_name,
      user_wallet_address,
    );
  }
}
