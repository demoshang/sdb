import { filter, isPlainObject, isString, upperFirst } from 'lodash';

import { Mongodb } from './client/mongodb';
import { Nedb } from './client/nedb';
import { Schema } from './schema';

class Model {
  private collName: string;

  private plugins: { [key: string]: any } = {};

  constructor(
    name: string,
    public schema: Schema,
    private client: Mongodb | Nedb,
    opts: { collName?: string } = {}
  ) {
    this.collName = opts.collName || name.toLowerCase();

    this.addPlugin('global', Schema.globalPlugins(this.schema));
  }

  public addPlugin(name: string, hooks: any) {
    if (!name || !hooks || !isString(name) || !isPlainObject(hooks)) {
      throw new TypeError('Wrong plugin name or hooks');
    }

    this.plugins[name] = {
      name,
      hooks,
    };
  }

  public async exec(op: string, ...args: any[]) {
    await this.execBefore(op, ...args);

    let collection;
    if (this.client instanceof Nedb) {
      collection = await this.client.getCollection<any>(this.collName);
    } else {
      collection = await this.client.getCollection<any>(this.collName);
    }

    const fn = (collection as any)[op];

    if (!fn || !(fn instanceof Function)) {
      throw new TypeError(`${op} not an attr`);
    }

    // run function
    const res = await fn.apply(collection, args);

    await this.execAfter(op, res);

    return res;
  }

  private async execBefore(op: string, ...args: any[]) {
    const hookName = `before${upperFirst(op)}`;
    const plugins = filter(this.plugins, (plugin) => plugin.hooks[hookName]);
    if (!plugins.length) {
      return;
    }

    for (let i = 0; i < plugins.length; i += 1) {
      const plugin = plugins[i];
      // eslint-disable-next-line no-await-in-loop
      await plugin.hooks[hookName].apply(null, args);
    }
  }

  private async execAfter(op: string, ...args: any[]) {
    const hookName = `after${upperFirst(op)}`;
    const plugins = filter(this.plugins, (plugin) => plugin.hooks[hookName]);
    if (!plugins.length) {
      return;
    }

    for (let i = 0; i < plugins.length; i += 1) {
      const plugin = plugins[i];
      // eslint-disable-next-line no-await-in-loop
      await plugin.hooks[hookName].apply(null, args);
    }
  }
}

export { Model };
