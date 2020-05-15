import { ObjectId, OptionalId } from 'mongodb';

export type Optional<T> = { [P in keyof T]?: T[P] };

export type Query<T> = (Optional<T> | { [P in keyof T]?: object } | { [key: string]: any }) & {
  _id?: any;
};
export type Project<T> = { [P in keyof T]?: 1 | 0 };
export type InsertDoc<T> = (
  | OptionalId<T>
  | { $set?: OptionalId<T>; $unset?: OptionalId<T> }
  | { [key: string]: any }
) & { _id?: any };

export interface IndexOptions {
  unique?: boolean;
  expireAfterSeconds?: number;
}

export interface FindOptions<T> {
  sort?: object;
  skip?: number;
  limit?: number;
  projection?: Project<T>;
}

export interface InsertManyResult {
  acknowledged?: boolean;
  _id: string[]; // ObjectId
}

export interface InsertResult {
  acknowledged?: boolean;
  _id: string; // ObjectId
}

export interface DeleteResult {
  n: number;
  ok: number;
  acknowledged?: boolean;
  deletedCount: number;
}

export interface UpdateOptions {
  upsert: boolean;
}

export interface UpdateResult extends Omit<UpdateWriteOpResult, 'upsertedId'> {
  upsertedId: {
    _id: ObjectId | string;
  };
}

export interface InsertOneWriteOpResult {
  insertedCount: number;
  insertedId: string;
  ops?: any[];
  connection?: any;
  result: { ok: number; n: number };
}

export interface UpdateWriteOpResult {
  result: { ok: number; n: number; nModified: number };
  connection: any;
  matchedCount: number;
  modifiedCount: number;
  upsertedCount: number;
  upsertedId: { _id: ObjectId };
}

export interface DeleteWriteOpResultObject {
  result: {
    ok?: number;
    n?: number;
  };
  connection?: any;
  deletedCount?: number;
}

export interface CollectionInsertOneOptions {
  serializeFunctions?: boolean;
  forceServerObjectId?: boolean;
  bypassDocumentValidation?: boolean;
  session?: any;
  w?: number | 'majority' | string;
  j?: boolean;
  wtimeout?: number;
}
