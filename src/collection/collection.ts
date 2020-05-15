import {
  CollectionInsertOneOptions,
  DeleteWriteOpResultObject,
  FindOptions,
  IndexOptions,
  InsertDoc,
  InsertOneWriteOpResult,
  Query,
  UpdateOptions,
  UpdateResult,
} from './interface';

abstract class Collection<T> {
  public abstract countDocuments(query: Query<T>): Promise<number>;

  public abstract createIndex(fieldOrSpec: string | object, options?: IndexOptions): Promise<void>;

  public abstract async deleteMany(filter: Query<T>): Promise<DeleteWriteOpResultObject>;

  public abstract async deleteOne(filter: Query<T>): Promise<DeleteWriteOpResultObject>;

  public abstract async dropIndex(indexName: string): Promise<void>;

  public abstract async find(query: Query<T>, options: FindOptions<T>): Promise<T[]>;

  public abstract async findOne(query: Query<T>, options: FindOptions<T>): Promise<T | null>;

  public abstract async insertMany(
    docs: InsertDoc<T>[],
    options?: CollectionInsertOneOptions
  ): Promise<{
    insertedCount: number;
    ops: any[];
    insertedIds: any;
    connection: any;
    result: { ok: number; n: number };
  }>;

  public abstract async insertOne(
    doc: InsertDoc<T>,
    options?: CollectionInsertOneOptions
  ): Promise<InsertOneWriteOpResult>;

  public abstract async updateMany(
    filter: Query<T>,
    document: InsertDoc<T>,
    options?: UpdateOptions
  ): Promise<UpdateResult>;

  public abstract async updateOne(
    filter: Query<T>,
    document: InsertDoc<T>,
    options?: UpdateOptions
  ): Promise<UpdateResult>;

  public abstract async drop(): Promise<void>;
}

export { Collection };
