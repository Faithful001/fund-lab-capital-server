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
import { Admin } from 'src/modules/admin/admin.model';
import JWT from 'src/utils/jwt.util';

@Injectable()
export class UserOrAdminIsAuthorizedMiddleware implements NestMiddleware {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Admin.name) private readonly adminModel: Model<Admin>,
  ) {}

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
      const decoded = JWT.verifyToken(token) as JwtPayload;

      if (!decoded || !decoded.role || !decoded.id) {
        throw new UnauthorizedException('Invalid token payload');
      }

      let userOrAdmin: any;

      if (decoded.role === 'USER') {
        userOrAdmin = await this.userModel
          .findById(decoded.userId)
          .select('_id role');
        if (!userOrAdmin) {
          throw new UnauthorizedException('User not found');
        }
        req.user = userOrAdmin;
      } else if (decoded.role === 'ADMIN') {
        userOrAdmin = await this.adminModel
          .findById(decoded.adminId)
          .select('_id role');
        if (!userOrAdmin) {
          throw new UnauthorizedException('Admin not found');
        }
        req.admin = userOrAdmin;
      } else {
        throw new UnauthorizedException('Invalid role');
      }

      next();
    } catch (error: any) {
      throw new UnauthorizedException(
        error.message || 'Invalid or expired token',
      );
    }
  }
}
