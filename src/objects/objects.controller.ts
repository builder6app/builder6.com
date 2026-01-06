import { Controller, Get, Post, Put, Delete, Body, Param, Render, Res, NotFoundException, Query } from '@nestjs/common';
import { Response } from 'express';
import { ObjectsService } from './objects.service';
import { Builder6Object } from './schemas/object.schema';
import { ProjectService } from '../projects/project.service';

@Controller('app/:projectId/objects')
export class ObjectsController {
  constructor(
    private readonly objectsService: ObjectsService,
    private readonly projectService: ProjectService
  ) {}

  @Get()
  @Render('objects/index')
  async index(@Param('projectId') projectId: string) {
    const objects = await this.objectsService.findAll('mock-user-id', projectId);
    const project = await this.projectService.findOne(projectId);

    if (!project) {
        throw new NotFoundException('Project not found');
    }

    return {
      user: { name: 'Developer' },
      project: project,
      objects,
      projectId 
    };
  }

  @Get('new')
  @Render('objects/editor')
  async newObject(@Param('projectId') projectId: string) {
    const project = await this.projectService.findOne(projectId);
    
    if (!project) {
        throw new NotFoundException('Project not found');
    }
    
    return {
      user: { name: 'Developer' },
      project: project,
      isNew: true,
      projectId
    };
  }

  @Get(':id')
  @Render('objects/editor')
  async editObject(@Param('id') id: string, @Param('projectId') projectId: string) {
    // Note: :id can be 'new' if route matched improperly, but 'new' is handled above.
    
    if (id === 'new') return this.newObject(projectId); // Fallback if needed, though Order matters
    
    const obj = await this.objectsService.findOne(id);
    const project = await this.projectService.findOne(projectId);

    if (!project) {
        throw new NotFoundException('Project not found');
    }

    return {
      user: { name: 'Developer' },
      project: project,
      object: obj,
      isNew: false,
      projectId: projectId
    };
  }

  @Post()
  async create(@Body() body: Partial<Builder6Object>) {
    return this.objectsService.create('mock-user-id', body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: Partial<Builder6Object>) {
    return this.objectsService.update(id, 'mock-user-id', body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.objectsService.delete(id, 'mock-user-id');
  }

  @Post('generate')
  async generate(@Body('prompt') prompt: string) {
    return this.objectsService.generateSchema(prompt);
  }
}

