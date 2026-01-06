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
    @ApiProperty({ description: 'Filter conditions', required: false, type: Object })
    where?: RecordWhereInput;

    @ApiProperty({ description: 'Fields to select', required: false, type: Object })
    select?: RecordSelectInput;

    @ApiProperty({ description: 'Sorting options', required: false, type: Object })
    orderBy?: RecordOrderByInput | RecordOrderByInput[];

    @ApiProperty({ description: 'Number of records to skip', required: false })
    skip?: number;

    @ApiProperty({ description: 'Number of records to take', required: false })
    take?: number;
}

export class FindUniqueDto {
    @ApiProperty({ description: 'Filter conditions (must match unique fields)', type: Object })
    where: RecordWhereInput;

    @ApiProperty({ description: 'Fields to select', required: false, type: Object })
    select?: RecordSelectInput;
}

export class CreateDto {
    @ApiProperty({ description: 'Data to create', type: Object })
    data: any;
}

export class UpdateDto {
    @ApiProperty({ description: 'Filter conditions to identify the record to update', type: Object })
    where: RecordWhereInput;

    @ApiProperty({ description: 'Data to update', type: Object })
    data: any;
}

export class DeleteDto {
    @ApiProperty({ description: 'Filter conditions to identify the record to delete', type: Object })
    where: RecordWhereInput;
}
