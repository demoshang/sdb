# SDB

a subset of MongoDB's API (the most used operations) Simple Database, support mongo / memory / file driver

![npm version](https://img.shields.io/npm/v/@s4p/sdb) ![coverage](https://img.shields.io/codecov/c/github/demoshang/sdb)

## How to use

1. if use mongodb storage, need `npm i mongodb`, else use memory or file storage, need `npm i nedb`

   ```ts
   import { SDB } from '@s4p/sdb';

   // mongodb
   // npm i mongodb
   const mongoSDB = new SDB();
   mongoSDB.connect('mongodb://localhost:27017/test');

   // memory
   // npm i nedb
   const memorySDB = new SDB('memory');

   // file
   // npm i nedb
   const fileSDB = new SDB('file://${absolute_path}');
   ```

2. create Schema Model

   ```ts
   const personSchema = {
     name: { type: 'string', required: true },
     age: { type: 'number', gte: 18, default: 20 },
     gender: { type: 'string', enum: ['male', 'female'] },
   };

   const personModel = fileSDB.model<{ name?: string; age?: number; gender?: string }>(
     'Person',
     personSchema
   );
   ```

3. `CRUD`

   ```ts
   async countDocuments(query: Query<T>): Promise<number>;

   async createIndex(fieldOrSpec: string | object, options?: IndexOptions): Promise<void>;

   async deleteMany(filter: Query<T>): Promise<DeleteWriteOpResultObject>;

   async deleteOne(filter: Query<T>): Promise<DeleteWriteOpResultObject>;

   async dropIndex(indexName: string): Promise<void>;

   async find(query: Query<T>, options: FindOptions<T>): Promise<T[]>;

   async findOne(query: Query<T>, options: FindOptions<T>): Promise<T | null>;

   async insertMany(docs: InsertDoc<T>[], options?: CollectionInsertOneOptions): Promise<InsertWriteOpResult<WithId<T>>>;

   async insertOne(doc: InsertDoc<T>, options?: CollectionInsertOneOptions): Promise<InsertOneWriteOpResult<WithId<T>>>;

   async updateMany(filter: Query<T>, document: InsertDoc<T>, options?: UpdateOptions): Promise<UpdateResult>;

   async updateOne(filter: Query<T>, document: InsertDoc<T>, options?: UpdateOptions): Promise<UpdateResult>;

   async drop(): Promise<void>;
   ```

## Subset

https://github.com/louischatriot/nedb#api

## Thanks

[Nedb](https://github.com/louischatriot/nedb)
[mongolass](https://github.com/nswbmw/mongolass)

## License

MIT
