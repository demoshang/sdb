import { MongoClientOptions } from 'mongodb';

import { getClient } from './client';
import { Mongodb } from './client/mongodb';
import { Nedb } from './client/nedb';
import { MongoCollection } from './collection/mongo';
import { NedbCollection } from './collection/nedb';
import { Model } from './model';
import { AJS, Schema, SchemaJson, Types } from './schema';

type ConnectOptions = MongoClientOptions & { memory?: boolean; timestampData?: boolean } & {
  collName?: string;
};

class SDB {
  private client?: Mongodb | Nedb;

  private models: {
    [key: string]: {
      name: string;
      plugins: any[];
      model: NedbCollection<any> | MongoCollection<any>;
    };
  } = {};

  constructor(private url?: string | 'memory', private opts?: ConnectOptions) {
    if (this.url) {
      this.client = getClient(this.url, this.opts);
    }
  }

  public connect(url: string, opts?: ConnectOptions) {
    if (!this.client) {
      this.url = url;
      this.opts = opts;

      this.client = getClient(url, opts);
    }

    return this.client;
  }

  public async disconnect() {
    await this.client?.disconnect();
  }

  public static Schema(name: string, schemaJSON: SchemaJson) {
    return new Schema(name, schemaJSON);
  }

  public model<T>(name: string, inputSchema: SchemaJson | Schema) {
    type ProxyModel = (
      | NedbCollection<{ _id?: any; createdAt?: Date; updatedAt?: Date } & T>
      | MongoCollection<{ _id?: any; createdAt?: Date; updatedAt?: Date } & T>
    ) &
      Model;

    // 如果已经存在
    if (this.models[name]) {
      return this.models[name].model as ProxyModel;
    }

    // 检查client 是否已经连接
    if (!this.client) {
      throw new Error('need connect function call');
    }

    // 创建 schema
    let schema;
    if (!(inputSchema instanceof Schema)) {
      schema = SDB.Schema(name, inputSchema);
    } else {
      schema = inputSchema;
    }

    const model = new Model(name, schema, this.client, this.opts);

    const proxyModel = new Proxy(model, {
      get(target: any, prop: string) {
        // 由 collection 处理
        if (!target[prop]) {
          return async (...args: any[]) => {
            return target.exec(prop, ...args);
          };
        }

        // model 处理
        return Reflect.get(target, prop);
      },
    });

    this.models[name] = {
      name,
      plugins: [],
      model: proxyModel,
    };

    return proxyModel as ProxyModel;
  }
}

export { SDB, AJS, Types };
