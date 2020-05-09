import test from 'ava';

import { personModel } from './util';

test.beforeEach(async (t) => {
  await personModel.deleteMany({});
  t.pass();
});

test('insertOne && findOne', async (t) => {
  const name = `insertOne ${Date.now()}`;

  await personModel.insertOne({
    name,
  });

  const nu = await personModel.countDocuments({ name });
  t.is(nu, 1);
  const person = await personModel.findOne({ name });
  t.is(person?.name, name);
});

test('insertMany && find', async (t) => {
  const name1 = `insert 1 ${Date.now()}`;
  const name2 = `insert 2 ${Date.now()}`;

  await personModel.insertMany([
    {
      name: name1,
    },
    {
      name: name2,
    },
  ]);

  const persons = await personModel.find({});
  const arr = persons
    .map(({ name }) => {
      return name;
    })
    .sort();

  t.deepEqual([name1, name2], arr);
});

test('countDocuments && updateOne && updateMany', async (t) => {
  const name1 = `insert 1 ${Date.now()}`;
  const name2 = `insert 2 ${Date.now()}`;
  const name3 = `insert 3 ${Date.now()}`;

  await personModel.insertMany([
    {
      name: name1,
      age: 20,
    },
    {
      name: name2,
      age: 20,
    },
  ]);

  let nu = await personModel.countDocuments({});
  t.is(nu, 2);

  await personModel.updateMany({ age: 20 }, { age: 50 });
  nu = await personModel.countDocuments({ age: 50 });
  t.is(nu, 2);

  await personModel.updateOne({ age: 50 }, { age: 20 });
  nu = await personModel.countDocuments({ age: 20 });
  t.is(nu, 1);

  await personModel.updateOne({ name: name3 }, { age: 20 }, { upsert: true });
  nu = await personModel.countDocuments({ name: name3 });
  t.is(nu, 1);
});

test('deleteOne && deleteMany', async (t) => {
  const name1 = `insert 1 ${Date.now()}`;
  const name2 = `insert 2 ${Date.now()}`;
  const name3 = `insert 3 ${Date.now()}`;

  await personModel.insertMany([
    {
      name: name1,
      age: 20,
    },
    {
      name: name2,
      age: 20,
    },
    {
      name: name3,
      age: 20,
    },
  ]);

  let nu = await personModel.countDocuments({});
  t.is(nu, 3);

  await personModel.deleteOne({ age: 20 });
  nu = await personModel.countDocuments({});
  t.is(nu, 2);

  await personModel.deleteMany({ age: 20 });
  nu = await personModel.countDocuments({});
  t.is(nu, 0);
});

test('createIndex && dropIndex', async (t) => {
  await personModel.createIndex({ name: 1 }, { unique: true });

  await personModel.insertOne({ name: 'name' });

  await t.throwsAsync(
    async () => {
      await personModel.insertOne({ name: 'name' });
    },
    { message: /unique/ }
  );

  await personModel.dropIndex('name');

  await t.notThrowsAsync(async () => {
    await personModel.insertOne({ name: 'name' });
  });
});

test('schema check', async (t) => {
  await t.throwsAsync(
    async () => {
      await personModel.insertOne({});
    },
    { message: /\$\.name.*required/ }
  );

  await t.throwsAsync(
    async () => {
      await personModel.insertOne({ name: 'name', age: 10 });
    },
    { message: /\$\.age.*gte/ }
  );

  await t.throwsAsync(
    async () => {
      await personModel.insertOne({ name: 'name', gender: 'male_' });
    },
    { message: /\$\.gender.*enum/ }
  );

  await personModel.insertOne({ name: 'name_default_age' });
  const person = await personModel.findOne({ name: 'name_default_age' });
  t.is(person?.age, 20);
});
