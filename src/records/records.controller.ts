import { Controller, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { RecordsService } from './records.service';
import { FindManyDto, FindUniqueDto, CreateDto, UpdateDto, DeleteDto } from './dto/records.dto';

@ApiTags('Records')
@Controller('api/records')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Post(':objectName/findMany')
  @ApiOperation({ summary: 'Find multiple records' })
  @ApiParam({ name: 'objectName', description: 'The name of the object' })
  async findMany(
    @Param('objectName') objectName: string,
    @Body() body: FindManyDto,
  ) {
    return this.recordsService.findMany(objectName, body);
  }

  @Post(':objectName/findUnique')
  @ApiOperation({ summary: 'Find a unique record' })
  @ApiParam({ name: 'objectName', description: 'The name of the object' })
  async findUnique(
    @Param('objectName') objectName: string,
    @Body() body: FindUniqueDto,
  ) {
    return this.recordsService.findUnique(objectName, body);
  }

  @Post(':objectName/create')
  @ApiOperation({ summary: 'Create a record' })
  @ApiParam({ name: 'objectName', description: 'The name of the object' })
  async create(
    @Param('objectName') objectName: string,
    @Body() body: CreateDto,
  ) {
    return this.recordsService.create(objectName, body);
  }

  @Post(':objectName/update')
  @ApiOperation({ summary: 'Update a record' })
  @ApiParam({ name: 'objectName', description: 'The name of the object' })
  async update(
    @Param('objectName') objectName: string,
    @Body() body: UpdateDto,
  ) {
    return this.recordsService.update(objectName, body);
  }

  @Post(':objectName/delete')
  @ApiOperation({ summary: 'Delete a record' })
  @ApiParam({ name: 'objectName', description: 'The name of the object' })
  async delete(
    @Param('objectName') objectName: string,
    @Body() body: DeleteDto,
  ) {
    return this.recordsService.delete(objectName, body);
  }
}
