import { Model } from './model';
import { AJS, Schema, SchemaJson, Types } from './schema';

class SDB {
  private models: {
    [key: string]: {
      name: string;
      plugins: any[];
      model: any;
    };
  } = {};

  constructor(private client?: any, private opts?: any) {}

  public static Schema(name: string, schemaJSON: SchemaJson) {
    return new Schema(name, schemaJSON);
  }

  public async disconnect() {
    await this.client?.disconnect();
  }

  public getModel<K>(name: string, inputSchema: SchemaJson | Schema): K {
    // 如果已经存在
    if (this.models[name]) {
      return this.models[name].model as K;
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

    return proxyModel as K;
  }
}

export { SDB, AJS, Types };
