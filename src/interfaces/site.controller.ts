import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { PlayService } from './play.service';
import { ProjectService } from './project.service';

@Controller('app')
export class SiteController {
  constructor(
    private readonly playService: PlayService,
    private readonly projectService: ProjectService,
  ) {}

  private async resolveProject(slugOrId: string) {
    let project = await this.projectService.findBySlug(slugOrId);
    if (!project) {
      try {
        project = await this.projectService.findOne(slugOrId);
      } catch (e) {
        // Ignore
      }
    }
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  @Get(':slug')
  async getHome(@Param('slug') slug: string, @Res() res: Response) {
    const project = await this.resolveProject(slug);

    if (!project.homePage) {
      return res.status(404).send('This project does not have a home page set.');
    }

    const page = await this.playService.findOne(project.homePage);
    if (!page) {
      return res.status(404).send('Home page not found.');
    }

    const pages = await this.playService.findAllByProject(project._id!);
    const navPages = pages.filter(p => p.addToNavigation);
    const editUrl = `/projects/${project._id}/${page._id}`;

    return res.render('app', { page, project, navPages, editUrl });
  }

  @Get(':slug/p/:pageId')
  async getPageById(
    @Param('slug') slug: string,
    @Param('pageId') pageId: string,
    @Res() res: Response,
  ) {
    const project = await this.resolveProject(slug);

    const page = await this.playService.findOne(pageId);
    if (!page || page.projectId !== project._id) {
      throw new NotFoundException('Page not found');
    }

    const pages = await this.playService.findAllByProject(project._id!);
    const navPages = pages.filter(p => p.addToNavigation);
    const editUrl = `/projects/${project._id}/${page._id}`;

    return res.render('app', { page, project, navPages, editUrl });
  }

  @Get(':slug/:path')
  async getPage(
    @Param('slug') slug: string,
    @Param('path') path: string,
    @Res() res: Response,
  ) {
    const project = await this.resolveProject(slug);

    const page = await this.playService.findByPath(project._id!, path);
    if (!page) {
      throw new NotFoundException('Page not found');
    }

    const pages = await this.playService.findAllByProject(project._id!);
    const navPages = pages.filter(p => p.addToNavigation);
    const editUrl = `/projects/${project._id}/${page._id}`;

    return res.render('app', { page, project, navPages, editUrl });
  }
}
