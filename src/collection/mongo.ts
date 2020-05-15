import {
  Collection,
  CollectionInsertOneOptions,
  DeleteWriteOpResultObject,
  IndexOptions,
  UpdateWriteOpResult,
} from 'mongodb';

import { Collection as AbstractCollection } from './collection';
import { FindOptions, InsertDoc, InsertOneWriteOpResult, Query, UpdateOptions } from './interface';

class MongoCollection<T> extends AbstractCollection<T> {
  constructor(private collection: Collection<T>) {
    super();
  }

  public async countDocuments(query: Query<T>): Promise<number> {
    return this.collection.countDocuments(query);
  }

  public async createIndex(fieldOrSpec: string | object, options?: IndexOptions): Promise<void> {
    await this.collection.createIndex(fieldOrSpec, options);
  }

  public async deleteMany(filter: Query<T>): Promise<DeleteWriteOpResultObject> {
    return this.collection.deleteMany(filter);
  }

  public async deleteOne(filter: Query<T>): Promise<DeleteWriteOpResultObject> {
    return this.collection.deleteOne(filter);
  }

  public async dropIndex(indexName: string): Promise<void> {
    return this.collection.dropIndex(indexName);
  }

  public async find(query: Query<T>, options?: FindOptions<T>): Promise<T[]> {
    const cursor = this.collection.find(query, options);
    return cursor.toArray();
  }

  public async findOne(query: Query<T>, options?: FindOptions<T>): Promise<T | null> {
    return this.collection.findOne(query, options);
  }

  public async insertMany(docs: InsertDoc<T>[], options?: CollectionInsertOneOptions) {
    return this.collection.insertMany(docs as any, options);
  }

  public async insertOne(doc: InsertDoc<T>, options?: CollectionInsertOneOptions) {
    return this.collection.insertOne(doc as any, options) as Promise<InsertOneWriteOpResult>;
  }

  public async updateMany(
    filter: Query<T>,
    document: InsertDoc<T>,
    options?: UpdateOptions
  ): Promise<UpdateWriteOpResult> {
    return this.collection.updateMany(filter, document, options);
  }

  public async updateOne(
    filter: Query<T>,
    document: InsertDoc<T>,
    options?: UpdateOptions
  ): Promise<UpdateWriteOpResult> {
    return this.collection.updateOne(filter, document, options);
  }

  public async drop() {
    return this.collection.drop();
  }
}

export { MongoCollection };
