import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { Model } from 'mongoose';
import { Observable } from 'rxjs';
import { ROLES_KEY } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { Token } from 'src/enums/token.enum';
import { User } from 'src/modules/user/user.model';
import JWT from 'src/utils/jwt.util';

@Injectable()
export class VerificationGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const req = context.switchToHttp().getRequest();

    try {
      const token = this.extractTokenFromHeader(req);

      const payload = JWT.verifyToken(token) as JwtPayload;
      if (!payload || !payload._id || !payload.purpose) {
        throw new UnauthorizedException('Invalid token payload');
      }

      const { _id, purpose } = payload;

      if (purpose !== Token.AUTHORIZATION) {
        throw new UnauthorizedException('Invalid token purpose');
      }

      const user = await this.userModel
        .findById(_id)
        .select('_id role verified');
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      req.user = user;

      if (requiredRoles && !requiredRoles.includes(user.role as Role)) {
        throw new ForbiddenException('User does not have the required role');
      }

      if (!user.verified || !user.paid_for_verification) {
        throw new ForbiddenException('User is not verified');
      }

      return true;
    } catch (error) {
      console.error('VerificationGuard error:', error);
      if (
        error.name === 'JsonWebTokenError' ||
        error.name === 'TokenExpiredError'
      ) {
        throw new UnauthorizedException('Invalid or expired token');
      }
      if (error instanceof ForbiddenException) {
        throw new ForbiddenException(error?.message);
      }
      throw new UnauthorizedException(
        error?.message ?? 'You are not authorized to access this resource',
      );
    }
  }

  private extractTokenFromHeader(req: Request): string {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization header is required');
    }

    return authorization.split(' ')[1];
  }
}
