import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrgAdminGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // 1. Validate Session
    const headers = new Headers(request.headers as any);
    const session = await this.authService.auth.api.getSession({
        headers
    });

    if (!session) {
        throw new UnauthorizedException('Not authenticated');
    }

    // 2. Get Active Organization
    const activeOrgId = (session.session as any).activeOrganizationId;

    if (!activeOrgId) {
        throw new ForbiddenException('No active organization selected');
    }

    // 3. Verify Role in Organization
    const member = await this.prisma.spaceUser.findFirst({
        where: {
            space: activeOrgId,
            user: session.user.id
        }
    });

    if (!member) {
        throw new ForbiddenException('Not a member of this organization');
    }

    if (member.role !== 'admin' && member.role !== 'owner') {
         throw new ForbiddenException('Organization Admin privileges required');
    }
    
    // 4. Attach to request for interceptor
    request['activeOrgId'] = activeOrgId;
    request['user'] = session.user;

    return true;
  }
}
