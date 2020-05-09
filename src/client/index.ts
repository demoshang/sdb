import { Mongodb } from './mongodb';
import { Nedb } from './nedb';

function getClient(url: string, opts?: object) {
  if (url === 'memory' || /^(nedb|file):\/\//.test(url)) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    const { Nedb: NedbClient } = require('./nedb');
    return new NedbClient(url, opts as { memory?: boolean }) as Nedb;
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
  const { Mongodb: MongodbClient } = require('./mongodb');
  return new MongodbClient(url, opts) as Mongodb;
}

export { getClient };
