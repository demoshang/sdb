import Datastore from 'nedb';
import { resolve as pathResolve } from 'path';

import { NedbCollection } from '../collection/nedb';
import { defer, Deferred } from '../common/defer';

function urlToPath(url: string) {
  return url.replace(/^(nedb|file):\/\//, '');
}

function getCollectionPath(dbLocation: string, collectionName: string) {
  if (dbLocation === 'memory') {
    return dbLocation;
  }
  return `${pathResolve(dbLocation, collectionName)}.db`;
}

async function createOriginCollection(
  collectionName: string,
  dbDir: string,
  { memory, timestampData = true }: { memory?: boolean; timestampData?: boolean } = {}
) {
  let db: Datastore;
  if (dbDir === 'memory') {
    db = new Datastore({ inMemoryOnly: true, timestampData });
  } else if (memory) {
    db = new Datastore({ inMemoryOnly: true, timestampData });
  } else {
    const collectionPath = getCollectionPath(dbDir, collectionName);
    db = new Datastore({ filename: collectionPath, timestampData });
  }

  return new Promise<Datastore>((resolve, reject) => {
    db.loadDatabase((err: Error) => {
      if (err) {
        return reject(err);
      }
      return resolve(db);
    });
  });
}

class Nedb {
  private collections: {
    [key: string]: Deferred<NedbCollection<any>>;
  } = {};

  private dbDir: string;

  constructor(url: string, private opts?: { memory?: boolean; timestampData?: boolean }) {
    this.dbDir = urlToPath(url);
  }

  // eslint-disable-next-line class-methods-use-this
  public disconnect() {}

  public async getCollection<T>(name: string, opts?: any): Promise<NedbCollection<T>> {
    if (this.collections[name]) {
      return this.collections[name].promise;
    }

    const deferred = defer<NedbCollection<T>>();
    this.collections[name] = deferred;

    try {
      const originCollection = await createOriginCollection(name, this.dbDir, {
        ...this.opts,
        ...opts,
      });
      const collection = new NedbCollection<T>(originCollection);
      deferred.resolve(collection);
    } catch (e) {
      deferred.reject(e);
    }

    return deferred.promise;
  }
}

export { Nedb };
