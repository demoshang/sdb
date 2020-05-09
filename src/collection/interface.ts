import { ObjectId, UpdateWriteOpResult, OptionalId } from 'mongodb';

export type Optional<T> = { [P in keyof T]?: T[P] };

export type Query<T> = (Optional<T> | { [P in keyof T]?: object }) & { _id?: any };
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
