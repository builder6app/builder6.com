import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.$connect();
    await this.ensureCollections();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  private async ensureCollections() {
    const collections = [
      'builder6_objects',
      'builder6_pages',
      'builder6_projects',
      'builder6_page_versions'
    ];

    for (const collection of collections) {
      try {
        await this.$runCommandRaw({ create: collection });
        this.logger.log(`Created collection: ${collection}`);
      } catch (error: any) {
        // Ignore "Collection already exists" error (Code 48)
        // Prisma might wrap the error, so we check message too or just ignore if it's about existence
        const isExistsError = 
           error.code === 48 || 
           (error.message && error.message.includes('already exists'));

        if (!isExistsError) {
           // If it's another error, we might want to log it but not crash startup
           // console.warn(`Failed to create collection ${collection}:`, error.message);
        }
      }
    }
  }
}
