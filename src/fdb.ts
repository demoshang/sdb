import { Nedb } from './client/nedb';
import { NedbCollection } from './collection/nedb';
import { Model } from './model';
import { Schema, SchemaJson } from './schema';
import { SDB } from './sdb';

type ConnectOptions = { memory?: boolean; timestampData?: boolean; collName?: string };

export type FdbModel<T> = NedbCollection<{ _id?: any; createdAt?: Date; updatedAt?: Date } & T> & Model;

class FDB {
  private sdb?: SDB;

  constructor(private url?: string | 'memory', private opts?: ConnectOptions) {
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

  public model<T>(name: string, inputSchema: SchemaJson | Schema) {
    // 检查client 是否已经连接
    if (!this.sdb) {
      throw new Error('need connect function call');
    }

    return this.sdb.getModel<FdbModel<T>>(name, inputSchema);
  }

  private createSDB() {
    const client = new Nedb(this.url || '', this.opts);
    this.sdb = new SDB(client, this.opts);
  }
}

export { FDB };
