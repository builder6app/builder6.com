import { Body, Controller, Get, Param, Post, Put, Delete, Req, Res, Render, Redirect } from '@nestjs/common';
import { Request, Response } from 'express';
import { ProjectService } from './project.service';
import { AuthService } from '../auth/auth.service';
import { PageService } from '../pages/page.service';
import { ObjectsService } from '../objects/objects.service'; // Import ObjectsService

@Controller('app')
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly authService: AuthService,
    private readonly PageService: PageService,
    private readonly objectsService: ObjectsService // Inject ObjectsService
  ) {}

  @Get()
  async index(@Req() req: Request, @Res() res: Response) {
    const session = await this.authService.auth.api.getSession({
      headers: new Headers(req.headers as any),
    });
    if (!session) {
      return res.redirect('/login');
    }
    const projects = await this.projectService.findAll(session.user.id);
    return res.render('projects/index', { projects, user: session.user });
  }

  @Get(':id')
  async show(@Req() req: Request, @Param('id') id: string, @Res() res: Response) {
    const session = await this.authService.auth.api.getSession({
      headers: new Headers(req.headers as any),
    });
    if (!session) {
      return res.redirect('/login');
    }
    
    // Find pages belonging to this project
    const pages = await this.PageService.findAllByProject(id);
    // Find objects belonging to this project
    const objects = await this.objectsService.findAll(session.user.id, id);
    
    // Fallback if no pages exist (shouldn't happen with new create logic, but for old projects)
    const project = await this.projectService.findOne(id);
    return res.render('projects/show', { project, pages, objects, user: session.user });
  }

  @Get(':projectId/:pageId')
  async editPage(@Req() req: Request, @Param('projectId') projectId: string, @Param('pageId') pageId: string, @Res() res: Response) {
    const session = await this.authService.auth.api.getSession({
      headers: new Headers(req.headers as any),
    });

    const page = await this.PageService.findOne(pageId);
    if (!page) {
      return res.redirect(`/app/${projectId}`);
    }

    const project = await this.projectService.findOne(projectId);
    const pages = await this.PageService.findAllByProject(projectId);

    return res.render('pages/editor', { page, projectId, project, pages, user: session?.user });
  }
}
