import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { Model } from 'mongoose';
import { ROLES_KEY } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { Token } from 'src/enums/token.enum';
import { Admin } from 'src/modules/admin/admin.model';
import { User } from 'src/modules/user/user.model';
import JWT from 'src/utils/jwt.util';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Admin.name) private readonly adminModel: Model<Admin>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const req = context.switchToHttp().getRequest<Request>();

    try {
      const token = this.extractTokenFromHeader(req);

      const { _id, purpose } = JWT.verifyToken(token) as JwtPayload;

      if (purpose !== Token.AUTHORIZATION) {
        throw new UnauthorizedException('Invalid token provided');
      }

      const user =
        (await this.userModel.findById(_id).select('_id role')) ||
        (await this.adminModel.findById(_id).select('_id role'));

      if (!user) {
        throw new UnauthorizedException('User not found. Proceed to verify');
      }

      // console.log('AuthGuard user:', user);

      req.user = user;

      if (requiredRoles && !requiredRoles.includes(user.role as Role)) {
        throw new ForbiddenException('User does not have the required role');
      }

      return true;
    } catch (error) {
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
