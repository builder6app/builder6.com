import { ApiProperty } from '@nestjs/swagger';

export class RecordWhereInput {
    [key: string]: any;
}

export class RecordSelectInput {
    [key: string]: boolean;
}

export class RecordOrderByInput {
    [key: string]: 'asc' | 'desc';
}

export class FindManyDto {
    @ApiProperty({ 
        description: 'Filter conditions', 
        required: false, 
        type: Object,
        example: { completed: false }
    })
    where?: RecordWhereInput;

    @ApiProperty({ 
        description: 'Fields to select', 
        required: false, 
        type: Object,
        example: { id: true, name: true }
    })
    select?: RecordSelectInput;

    @ApiProperty({ 
        description: 'Sorting options', 
        required: false, 
        type: Object,
        example: { created: 'desc' }
    })
    orderBy?: RecordOrderByInput | RecordOrderByInput[];

    @ApiProperty({ description: 'Number of records to skip', required: false, example: 0 })
    skip?: number;

    @ApiProperty({ description: 'Number of records to take', required: false, example: 10 })
    take?: number;
}

export class FindUniqueDto {
    @ApiProperty({ 
        description: 'Filter conditions (must match unique fields)', 
        type: Object,
        example: { id: "record_id" }
    })
    where: RecordWhereInput;

    @ApiProperty({ 
        description: 'Fields to select', 
        required: false, 
        type: Object,
        example: { id: true, title: true }
    })
    select?: RecordSelectInput;
}

export class CreateDto {
    @ApiProperty({ 
        description: 'Data to create', 
        type: Object,
        example: { title: "New Task", completed: false }
    })
    data: any;
}

export class UpdateDto {
    @ApiProperty({ 
        description: 'Filter conditions to identify the record to update', 
        type: Object,
        example: { id: "record_id" }
    })
    where: RecordWhereInput;

    @ApiProperty({ 
        description: 'Data to update', 
        type: Object,
        example: { completed: true }
    })
    data: any;
}

export class DeleteDto {
    @ApiProperty({ 
        description: 'Filter conditions to identify the record to delete', 
        type: Object,
        example: { id: "record_id" }
    })
    where: RecordWhereInput;
}
