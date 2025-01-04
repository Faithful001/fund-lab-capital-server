import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './modules/user/user.module';
import { GatewayModule } from './modules/gateway/gateway.module';
import { PlanModule } from './modules/plan/plan.module';
import { UserIsAuthorizedMiddleware } from './middlewares/user-is-authorized.middleware';
import { AdminIsAuthorizedMiddleware } from './middlewares/admin-is-authorized';
import { WalletModule } from './modules/wallet/wallet.module';
import { ReferralModule } from './modules/referral/referral.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { InvestmentModule } from './modules/investment/investment.module';
import { OtpModule } from './modules/otp/otp.module';
import { AdminModule } from './modules/admin/admin.module';
import { WithdrawalMessageModule } from './modules/withdrawal-message/withdrawal-message.module';
import { KycDocumentModule } from './kyc-document/kyc-document.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI),
    UserModule,
    GatewayModule,
    PlanModule,
    WalletModule,
    ReferralModule,
    TransactionModule,
    InvestmentModule,
    OtpModule,
    AdminModule,
    WithdrawalMessageModule,
    KycDocumentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  // configure(consumer: MiddlewareConsumer) {
  // Define routes excluded from UserIsAuthorizedMiddleware
  // consumer
  //   .apply(UserIsAuthorizedMiddleware)
  //   .exclude(
  //     { path: 'user/(.*)', method: RequestMethod.ALL },
  //     // { path: 'admin/(.*)', method: RequestMethod.ALL },
  //     { path: 'plan/(.*)', method: RequestMethod.ALL },
  //   )
  //   .forRoutes('*');
  // consumer
  //   .apply(AdminIsAuthorizedMiddleware)
  //   // .exclude('(.*)')
  //   .forRoutes(
  //     { path: 'admin/get-total', method: RequestMethod.POST },
  //     { path: 'user/get-all-users', method: RequestMethod.GET },
  //   );
  // }
}
