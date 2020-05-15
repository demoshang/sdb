import { MongoClientOptions } from 'mongodb';

import { Mongodb } from './client/mongodb';
import { MongoCollection } from './collection/mongo';
import { Model } from './model';
import { Schema, SchemaJson } from './schema';
import { SDB } from './sdb';

type ConnectOptions = MongoClientOptions & {
  collName?: string;
};

export type MdbModel<T> = MongoCollection<{ _id?: any; createdAt?: Date; updatedAt?: Date } & T> &
  Model;

class MDB {
  private sdb?: SDB;

  constructor(private url?: string, private opts?: ConnectOptions) {
    if (this.url) {
      this.createSDB();
    }
  }

  public connect(url: string, opts?: ConnectOptions) {
    if (!this.sdb) {
      this.url = url;
      this.opts = opts;

      this.createSDB();
    }
  }

  public async disconnect() {
    await this.sdb?.disconnect();
  }

  public static Schema(name: string, schemaJSON: SchemaJson) {
    return new Schema(name, schemaJSON);
  }

  public model<T>(name: string, inputSchema: SchemaJson | Schema) {
    // 检查client 是否已经连接
    if (!this.sdb) {
      throw new Error('need connect function call');
    }

    return this.sdb.getModel<MdbModel<T>>(name, inputSchema);
  }

  private createSDB() {
    const client = new Mongodb(this.url || '', this.opts);
    this.sdb = new SDB(client, this.opts);
  }
}

export { MDB };
