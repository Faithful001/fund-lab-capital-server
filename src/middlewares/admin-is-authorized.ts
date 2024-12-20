import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { NextFunction, Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { Model } from 'mongoose';
import JWT from 'src/utils/jwt.util';
import { Admin } from 'src/modules/admin/admin.model';

@Injectable()
export class AdminIsAuthorizedMiddleware implements NestMiddleware {
  constructor(@InjectModel(Admin.name) private adminModel: Model<Admin>) {}

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

      const admin = await this.adminModel.findById(id).select('_id id role');
      if (!admin || admin.role !== 'ADMIN') {
        throw new UnauthorizedException('User is unauthorized');
      }

      req.admin = admin;

      next();
    } catch (error: any) {
      throw new UnauthorizedException(
        error.message || 'Invalid or expired token',
      );
    }
  }
}
