import { MongoClient, MongoClientOptions } from 'mongodb';

import { MongoCollection } from '../collection/mongo';
import { defer, Deferred } from '../common/defer';

class Mongodb {
  private collections: {
    [key: string]: Deferred<MongoCollection<any>>;
  } = {};

  private deferred?: Deferred<MongoClient>;

  constructor(private url: string, private opts?: MongoClientOptions) {}

  public async connect() {
    if (!this.deferred) {
      this.deferred = defer<MongoClient>();

      try {
        const client = await MongoClient.connect(this.url, { useNewUrlParser: true, ...this.opts });
        this.deferred.resolve(client);
      } catch (e) {
        this.deferred.reject(e);
      }
    }

    return this.deferred.promise;
  }

  public async disconnect() {
    if (this.deferred) {
      const client = await this.deferred.promise;
      client.close();
    }
  }

  public async getCollection<T>(name: string, opts?: any) {
    if (this.collections[name]) {
      return this.collections[name].promise;
    }

    const deferred = defer<MongoCollection<T>>();
    this.collections[name] = deferred;

    try {
      const client = await this.connect();
      const originCollection = client.db().collection(name, opts);
      const collection = new MongoCollection<T>(originCollection);
      deferred.resolve(collection);
    } catch (e) {
      deferred.reject(e);
    }

    return deferred.promise;
  }
}

export { Mongodb };
