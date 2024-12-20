import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { NextFunction, Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { Model } from 'mongoose';
import { User } from 'src/modules/user/user.model';
import JWT from 'src/utils/jwt.util';

@Injectable()
export class UserIsAuthorizedMiddleware implements NestMiddleware {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      throw new UnauthorizedException('Authorization header required');
    }
    const token = authorizationHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Token is required');
    }

    try {
      const { id } = JWT.verifyToken(token) as JwtPayload;

      const user = await this.userModel.findById(id).select('_id id role');
      if (!user || user.role !== 'USER') {
        throw new UnauthorizedException('User is unauthorized');
      }

      req.user = user;

      // Set the user data using the service
      // this.userRequestService.setUser(user.id, user.role);
      // console.log('UserRequestService set:', this.userRequestService.getUser());

      next();
    } catch (error: any) {
      throw new UnauthorizedException(
        error.message || 'Invalid or expired token',
      );
    }
  }
}
