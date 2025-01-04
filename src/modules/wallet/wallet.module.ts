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
import { CloudinaryService } from 'src/services/cloudinary.service';
import { UserRequestService } from 'src/contexts/services/user-request.service';
import { User, UserSchema } from '../user/user.model';
import { OtpService } from '../otp/otp.service';
import { Otp, OtpSchema } from '../otp/otp.model';
import { AdminModule } from '../admin/admin.module';
import { UserModule } from '../user/user.module';
import {
  WithdrawalMessage,
  WithdrawalMessageSchema,
} from '../withdrawal-message/withdrawal-message.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Wallet.name, schema: WalletSchema },
      { name: Gateway.name, schema: GatewaySchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: User.name, schema: UserSchema },
      { name: WithdrawalMessage.name, schema: WithdrawalMessageSchema },
      { name: Otp.name, schema: OtpSchema },
    ]),
    UserModule,
    AdminModule,
  ],
  controllers: [WalletController],
  providers: [WalletService, CloudinaryService, UserRequestService, OtpService],
})
export class WalletModule {}
