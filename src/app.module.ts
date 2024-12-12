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
import { UserIsAuthenticatedMiddleware } from './contexts/middlewares/user-is-authenticated.middleware';
import { GatewayController } from './modules/gateway/gateway.controller';
import { UserRequestService } from './contexts/services/user-request.service';
import { WalletController } from './modules/wallet/wallet.controller';
import { WalletModule } from './modules/wallet/wallet.module';
import { ReferralModule } from './modules/referral/referral.module';
import { ReferralController } from './modules/referral/referral.controller';
import { TransactionModule } from './modules/transaction/transaction.module';
import { InvestmentModule } from './modules/investment/investment.module';
import { PlanController } from './modules/plan/plan.controller';

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
  ],
  controllers: [AppController],
  providers: [AppService, UserRequestService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    const excludedRoutes = [
      { path: 'auth/login', method: RequestMethod.POST },
      { path: 'auth/register', method: RequestMethod.POST },
      { path: 'auth/verify-token', method: RequestMethod.POST },
      { path: 'plan/create', method: RequestMethod.POST },
      { path: 'plan/get', method: RequestMethod.GET },
      { path: 'plan/get/:id', method: RequestMethod.GET },
      { path: 'plan/update/:id', method: RequestMethod.PATCH },
      { path: 'plan/delete/:id', method: RequestMethod.DELETE },
    ];

    consumer
      .apply(UserIsAuthenticatedMiddleware)
      .exclude(...excludedRoutes)
      .forRoutes('*');
  }
}
