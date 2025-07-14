import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { ROLE_KEY } from "src/common/decorator/role.decorator";
import { AuthService } from "../auth.service";
import { Roles } from "src/common/enum/roles.enum";
import { Request } from "express";

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private reflector: Reflector
  ) {}
  async canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride<Roles[]>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length == 0) return true;
    const httpContext = context.switchToHttp();
    const request: Request = httpContext.getRequest<Request>();
    const user = request.user;
    const userRole = user?.role ?? Roles.User;
    if (user?.role === Roles.Admin) return true;
    if (requiredRoles.includes(userRole as Roles)) return true;
    throw new ForbiddenException();
  }
}
