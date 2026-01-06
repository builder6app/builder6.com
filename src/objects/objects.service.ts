import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { Builder6Object } from './schemas/object.schema';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ObjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService
  ) {}

  private generateId(length = 20): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async generateSchema(prompt: string) {
    return this.aiService.generateObjectDefinition(prompt);
  }

  async findAll(userId: string, projectId?: string): Promise<Builder6Object[]> {
    const where: any = {};
    if (projectId) {
      where.projectId = projectId;
    }
    // Prisma returns { id: ... }, we need to map to { _id: ... } for compatibility
    const objects = await this.prisma.builder6Object.findMany({
        where,
        orderBy: { modified: 'desc' }
    });
    
    return objects.map(obj => ({
        ...obj,
        _id: obj.id
    }));
  }

  async findOne(id: string): Promise<Builder6Object> {
    const obj = await this.prisma.builder6Object.findUnique({
        where: { id }
    });
    if (!obj) {
      throw new NotFoundException(`Object #${id} not found`);
    }
    return { ...obj, _id: obj.id };
  }

  async create(userId: string, data: Partial<Builder6Object>): Promise<Builder6Object> {
    const id = this.generateId();
    const newObject = await this.prisma.builder6Object.create({
        data: {
            id: id,
            projectId: data.projectId,
            name: data.name || 'untitled',
            label: data.label || 'Untitled',
            description: data.description,
            icon: data.icon || 'star',
            schema: data.schema || '',
            owner: userId,
        }
    });

    return { ...newObject, _id: newObject.id };
  }

  async update(id: string, userId: string, updateData: Partial<Builder6Object>): Promise<Builder6Object> {
    // Ensure we don't update immutable fields like _id or created
    const { _id, created, ...toUpdate } = updateData;
    
    const updated = await this.prisma.builder6Object.update({
        where: { id },
        data: {
            ...toUpdate,
            // modified is auto-updated by @updatedAt
        }
    });
    return { ...updated, _id: updated.id };
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.prisma.builder6Object.delete({
        where: { id }
    });
  }
}
