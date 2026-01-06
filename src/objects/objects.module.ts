import { Module, forwardRef } from '@nestjs/common';
import { ObjectsController } from './objects.controller';
import { ObjectsService } from './objects.service';
import { AiModule } from '../ai/ai.module';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [
    AiModule, 
    forwardRef(() => ProjectsModule)
  ],
  controllers: [ObjectsController],
  providers: [ObjectsService],
  exports: [ObjectsService], // Export ObjectsService
})
export class ObjectsModule {}

