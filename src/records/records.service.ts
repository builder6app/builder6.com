import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { Db, ObjectId } from 'mongodb';

@Injectable()
export class RecordsService {
  constructor(
    @Inject('DATABASE_CONNECTION') private db: Db,
  ) {}

  private getCollection(objectName: string) {
    return this.db.collection(objectName);
  }

  // Convert Prisma 'where' to MongoDB filter
  private parseWhere(where: any) {
    if (!where) return {};
    const filter: any = {};
    
    for (const [key, value] of Object.entries(where)) {
        if (key === 'AND' && Array.isArray(value)) {
            filter['$and'] = value.map(v => this.parseWhere(v));
        } else if (key === 'OR' && Array.isArray(value)) {
            filter['$or'] = value.map(v => this.parseWhere(v));
        } else if (key === 'NOT' && Array.isArray(value)) {
            filter['$nor'] = value.map(v => this.parseWhere(v)); // Simplified NOT
        } else if (typeof value === 'object' && value !== null) {
            // Handle operators like equals, contains, gt, lt, in, etc.
            const ops: any = {};
            for (const [op, opValue] of Object.entries(value)) {
                switch(op) {
                    case 'equals': ops['$eq'] = opValue; break;
                    case 'not': ops['$ne'] = opValue; break;
                    case 'in': ops['$in'] = opValue; break;
                    case 'notIn': ops['$nin'] = opValue; break;
                    case 'lt': ops['$lt'] = opValue; break;
                    case 'lte': ops['$lte'] = opValue; break;
                    case 'gt': ops['$gt'] = opValue; break;
                    case 'gte': ops['$gte'] = opValue; break;
                    case 'contains': ops['$regex'] = opValue; ops['$options'] = 'i'; break; 
                    case 'startsWith': ops['$regex'] = `^${opValue}`; ops['$options'] = 'i'; break;
                    case 'endsWith': ops['$regex'] = `${opValue}$`; ops['$options'] = 'i'; break;
                    // Add more mappings as needed
                    default: 
                         // Check if nested relation filter or direct usage? 
                         // For now, assume simple field ops. 
                         // If it doesn't match known ops, it might be a direct value compare if structure is different?
                         // But Prisma usually wraps value in operators unless implicit equality.
                         // However, { field: value } is also valid in Prisma for equals.
                        break;
                }
            }
            // If empty ops, maybe it was a direct nested object check?
            if (Object.keys(ops).length > 0) {
               filter[key] = ops;
            } else {
               // Fallback: assume direct equality for implicit equals
               // But usually this block is entered because value is an object (operators).
               // If value was primitive, it wouldn't be 'object'.
               // Wait, Prisma { name: 'Alice' } -> value is 'Alice' (string). 
               // This loop handles keys of 'where'. if value is primitive, it goes to 'else' below.
            }
        } else {
            // Implicit equals
            if (key === 'id' || key === '_id') {
                 // Try to convert to ObjectId if it looks like one, only for _id queries.
                 // Steedos objects usually use string IDs but if we want mongo compatibility...
                 // Let's assume string IDs for now as seen in `generateId` in ObjectsService.
                 filter['_id'] = value;
            } else {
                 filter[key] = value;
            }
        }
    }
    return filter;
  }

  // Convert Prisma 'select' to MongoDB projection
  private parseSelect(select: any) {
    if (!select) return null;
    const projection: any = {};
    for (const [key, value] of Object.entries(select)) {
      if (value === true) {
        projection[key] = 1;
      }
    }
    return projection;
  }
  
  // Convert Prisma 'orderBy' to MongoDB sort
  private parseOrderBy(orderBy: any) {
      if (!orderBy) return {};
      // Prisma orderBy can be an array or object
      // { field: 'asc' } or [{ field: 'asc' }]
      const sort: any = {};
      const items = Array.isArray(orderBy) ? orderBy : [orderBy];
      
      for (const item of items) {
          for (const [key, value] of Object.entries(item)) {
              sort[key] = value === 'asc' ? 1 : -1;
          }
      }
      return sort;
  }

  private generateId(length = 20): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async findMany(objectName: string, params: any) {
    const { where, select, orderBy, skip, take } = params;
    
    const filter = this.parseWhere(where);
    const projection = this.parseSelect(select);
    const sort = this.parseOrderBy(orderBy);
    
    let cursor = this.getCollection(objectName).find(filter);
    
    if (projection) {
        cursor = cursor.project(projection);
    }
    if (Object.keys(sort).length > 0) {
        cursor = cursor.sort(sort);
    }
    if (skip) {
        cursor = cursor.skip(skip);
    }
    if (take) {
        cursor = cursor.limit(take);
    }
    
    return cursor.toArray();
  }

  async findUnique(objectName: string, params: any) {
    const { where, select } = params;
    const filter = this.parseWhere(where);
    const projection = this.parseSelect(select);
    
    const options = projection ? { projection } : {};
    return this.getCollection(objectName).findOne(filter, options);
  }

  async create(objectName: string, params: any) {
    const { data } = params;
    if (!data) throw new BadRequestException('No data provided');
    
    // Prepare data
    const record = { ...data };
    
    // Map 'id' to '_id' if present and '_id' is missing
    if (record.id && !record._id) {
        record._id = record.id;
        delete record.id;
    }
    
    // Generate _id if missing
    if (!record._id) {
        record._id = this.generateId();
    }
    
    await this.getCollection(objectName).insertOne(record);
    
    return record;
  }

  async update(objectName: string, params: any) {
    const { where, data } = params;
    const filter = this.parseWhere(where);
    
    if (!data) throw new BadRequestException('No data provided');

    // Prisma update does atomic updates.
    // We'll use $set for the data provided.
    // Need to handle atomic number operations if Prisma style (increment, etc) is used?
    // For now, assume simple set.
    
    const updateOp = { $set: data };
    
    // findOneAndUpdate
    const result = await this.getCollection(objectName).findOneAndUpdate(
        filter, 
        updateOp,
        { returnDocument: 'after' }
    );
    
    return result;
  }

  async delete(objectName: string, params: any) {
    const { where } = params;
    const filter = this.parseWhere(where);
    
    const result = await this.getCollection(objectName).findOneAndDelete(filter);
    return result;
  }
}

