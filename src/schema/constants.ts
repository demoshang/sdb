export const singleFormatOperators = [
  '$eq',
  '$gt',
  '$gte',
  '$lt',
  '$lte',
  '$ne',
  '$in',
  '$nin',
  '$not',
  '$elemMatch',
];

export const arrayFormatOperators = ['$and', '$nor', '$or', '$all'];

export const skipFormatOperators = [
  '$exists',
  '$type',
  '$expr',
  '$jsonSchema',
  '$mod',
  '$regexp',
  '$options',
  '$text',
  '$where',
  '$geoIntersects',
  '$geoWithin',
  '$near',
  '$nearSphere',
  '$size',
  '$$bitsAllClear',
  '$bitsAllSet',
  '$bitsAnyClear',
  '$bitsAnySet',
  '$comment',
  '$meta',
  '$slice',
];
