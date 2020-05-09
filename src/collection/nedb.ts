import { isNil } from 'lodash';
import {
  DeleteWriteOpResultObject,
  IndexOptions,
  InsertOneWriteOpResult,
  UpdateWriteOpResult,
  WithId,
} from 'mongodb';
import { EnsureIndexOptions } from 'nedb';

import { Collection } from './collection';
import { FindOptions, InsertDoc, Query, UpdateOptions } from './interface';

class NedbCollection<T> extends Collection<T> {
  constructor(private collection: Nedb) {
    super();
  }

  public async countDocuments(query: Query<T>): Promise<number> {
    return new Promise((resolve, reject) => {
      this.collection.count(query, (err, n) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(n);
      });
    });
  }

  public async createIndex(
    fieldOrSpec: string | object,
    { unique, expireAfterSeconds }: IndexOptions = {}
  ): Promise<void> {
    let nedbIndexOptions: EnsureIndexOptions;

    if (typeof fieldOrSpec === 'string') {
      nedbIndexOptions = {
        fieldName: fieldOrSpec,
        unique,
        expireAfterSeconds,
      };
    } else {
      const keys = Object.keys(fieldOrSpec);
      if (keys.length > 1) {
        throw new TypeError('nedb index support only one field');
      }
      nedbIndexOptions = {
        fieldName: keys[0],
        unique,
        expireAfterSeconds,
      };
    }

    return new Promise((resolve, reject) => {
      this.collection.ensureIndex(nedbIndexOptions, (err) => {
        if (err) {
          reject(err);
          return;
        }

        resolve();
      });
    });
  }

  public async deleteMany(filter: Query<T>): Promise<DeleteWriteOpResultObject> {
    return new Promise((resolve, reject) => {
      this.collection.remove(filter, { multi: true }, (err, n) => {
        if (err) {
          reject(err);
          return;
        }

        resolve({
          result: {
            ok: n,
            n,
          },
          deletedCount: n,
        });
      });
    });
  }

  public async deleteOne(filter: Query<T>): Promise<DeleteWriteOpResultObject> {
    return new Promise((resolve, reject) => {
      this.collection.remove(filter, { multi: false }, (err, n) => {
        if (err) {
          reject(err);
          return;
        }

        resolve({
          result: {
            ok: n,
            n,
          },
          deletedCount: n,
        });
      });
    });
  }

  public async dropIndex(indexName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.collection.removeIndex(indexName.replace(/_\d+$/, ''), (err) => {
        if (err) {
          reject(err);
          return;
        }

        resolve();
      });
    });
  }

  public async find(
    query: Query<T>,
    { sort, skip, limit, projection }: FindOptions<T> = {}
  ): Promise<T[]> {
    let cursor = this.collection.find(query, projection);

    if (sort) {
      cursor = cursor.sort(sort);
    }

    if (!isNil(skip)) {
      cursor = cursor.skip(skip);
    }

    if (limit) {
      cursor = cursor.limit(limit);
    }

    return new Promise((resolve, reject) => {
      cursor.exec((err, documents) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(documents as any);
      });
    });
  }

  public async findOne(
    query: Query<T>,
    { sort, projection }: FindOptions<T> = {}
  ): Promise<T | null> {
    const [doc] = await this.find(query, { sort, projection, limit: 1 });
    return doc;
  }

  public async insertMany(docs: InsertDoc<T>[]) {
    const arr = await Promise.all(
      docs.map((doc) => {
        return this.insertOne(doc).catch((e) => {
          return e;
        });
      })
    );

    let ok = 0;
    const insertedIds: any[] = [];
    arr.forEach((item) => {
      if (item && item.insertedId) {
        ok += 1;
        insertedIds.push(item.insertedId);
      }
    });

    return {
      insertedCount: ok,
      insertedIds,
      ops: [],
      connection: undefined,
      result: { ok, n: arr.length },
    };
  }

  public async insertOne(doc: InsertDoc<T>): Promise<InsertOneWriteOpResult<WithId<T>>> {
    return new Promise((resolve, reject) => {
      this.collection.insert(doc, (err, data) => {
        if (err) {
          reject(err);
          return;
        }

        resolve({
          insertedCount: 1,
          insertedId: data._id as any,
          ops: [],
          connection: undefined,
          result: { ok: 1, n: 1 },
        });
      });
    });
  }

  public async updateMany(
    filter: Query<T>,
    document: InsertDoc<T>,
    options?: UpdateOptions
  ): Promise<UpdateWriteOpResult> {
    return new Promise((resolve, reject) => {
      this.collection.update(filter, document, { ...options, multi: true }, (err, numAffected) => {
        if (err) {
          reject(err);
          return;
        }

        resolve({
          result: { ok: numAffected, n: numAffected, nModified: -1 },
          connection: undefined,
          matchedCount: -1,
          modifiedCount: -1,
          upsertedCount: -1,
          upsertedId: undefined as any,
        });
      });
    });
  }

  public async updateOne(
    filter: Query<T>,
    document: InsertDoc<T>,
    options?: UpdateOptions
  ): Promise<UpdateWriteOpResult> {
    return new Promise((resolve, reject) => {
      this.collection.update(filter, document, { ...options, multi: false }, (err) => {
        if (err) {
          reject(err);
          return;
        }

        resolve({
          result: { ok: 1, n: 1, nModified: -1 },
          connection: undefined,
          matchedCount: -1,
          modifiedCount: -1,
          upsertedCount: -1,
          upsertedId: undefined as any,
        });
      });
    });
  }

  public async drop(force = false) {
    if (!force) {
      throw new Error('nedb not support drop');
    }

    await this.deleteMany({});
    await new Promise((resolve, reject) => {
      this.collection.loadDatabase((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

export { NedbCollection };
