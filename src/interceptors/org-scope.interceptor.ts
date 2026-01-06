import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class OrgScopeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const activeOrgId = request['activeOrgId'];
    
    if (activeOrgId && request.body) {
        const body = request.body;
        
        // 1. Inject into 'where' (for Find, Update, Delete)
        // If it's a read/update/delete op, we usually want to restrict scope
        // Simple heuristic: if 'where' is present OR it's a find/delete endpoint
        // records/xxx/findMany, records/xxx/findUnique, records/xxx/delete, records/xxx/update
        
        const isReadOrWrite = 
            request.url.includes('/find') || 
            request.url.includes('/update') || 
            request.url.includes('/delete');

        if (isReadOrWrite) {
             if (!body.where) body.where = {};
             // Prisma combines top-level properties with AND
             body.where.space = activeOrgId;
        }

        // 2. Inject into 'data' (for Create, Update)
        // records/xxx/create, records/xxx/update
        if (body.data) {
             body.data.space = activeOrgId;
        }
    }
    
    return next.handle();
  }
}
