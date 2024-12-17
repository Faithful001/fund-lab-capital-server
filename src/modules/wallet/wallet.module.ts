import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Wallet, WalletSchema } from './wallet.model';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { Gateway, GatewaySchema } from '../gateway/gateway.model';
import {
  Transaction,
  TransactionSchema,
} from '../transaction/transaction.model';
import { CloudinaryService } from 'src/contexts/services/cloudinary.service';
import { UserRequestService } from 'src/contexts/services/user-request.service';
import { User, UserSchema } from '../user/user.model';
import { OtpService } from '../otp/otp.service';
import { Otp, OtpSchema } from '../otp/otp.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Wallet.name, schema: WalletSchema },
      { name: Gateway.name, schema: GatewaySchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: User.name, schema: UserSchema },
      { name: Otp.name, schema: OtpSchema },
    ]),
  ],
  controllers: [WalletController],
  providers: [WalletService, CloudinaryService, UserRequestService, OtpService],
})
export class WalletModule {}
