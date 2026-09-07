import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Role } from '../enums';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const requestedTenantId = request.headers['x-tenant-id'] || request.query.tenantId || request.params.tenantId;

    if (!user) return true;

    // Super Admin can access any tenant
    if (user.role === Role.SUPER_ADMIN) return true;

    // Citizens can interact with multiple tenants (cross-city requests)
    if (user.role === Role.CITIZEN) return true;

    // Staff members (Operators, Secretaries, Admins) must only access their own tenant
    if (user.tenantId && requestedTenantId && user.tenantId.toString() !== requestedTenantId.toString()) {
      throw new ForbiddenException('Acesso não autorizado para os dados desta prefeitura/organização.');
    }

    return true;
  }
}
