import { Module } from '@nestjs/common';
import { InvestmentService } from './investment.service';
import { InvestmentController } from './investment.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Investment, InvestmentSchema } from './investment.model';
import { Gateway, GatewaySchema } from '../gateway/gateway.model';
import { Plan, PlanSchema } from '../plan/plan.model';
import { CloudinaryService } from 'src/services/cloudinary.service';
import { Wallet, WalletSchema } from '../wallet/wallet.model';
import {
  Transaction,
  TransactionSchema,
} from '../transaction/transaction.model';
import { User, UserSchema } from '../user/user.model';
import { UserModule } from '../user/user.module';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Investment.name, schema: InvestmentSchema },
      { name: Gateway.name, schema: GatewaySchema },
      { name: Plan.name, schema: PlanSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Wallet.name, schema: WalletSchema },
      { name: User.name, schema: UserSchema },
    ]),
    UserModule,
    AdminModule,
  ],
  controllers: [InvestmentController],
  providers: [InvestmentService, CloudinaryService],
})
export class InvestmentModule {}
