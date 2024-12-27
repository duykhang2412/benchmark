import { getOrThrow, setupConfiguration } from '@packages/common';
import { resolve } from 'path';
import * as process from 'process';
import { ulid } from 'ulid';

setupConfiguration();
const packageMeta = require(resolve('package.json'));
export const PACKAGE = packageMeta.name;
export const VERSION = packageMeta.version;
export const HTTP_PORT = getOrThrow<number>('service.http_port');
export const GRPC_PORT = getOrThrow<number>('service.grpc_port');

interface DbConfig {
  clientUrl: string;
  dbName: string;
  collectionName: string;
}
export const USER_URL = getOrThrow<string>(
  'benchmark.endpoints.path',
);

export const APP_DB_TEST = ulid();
export const APP_IS_TEST = process.env.NODE_ENV === 'test';

export const MONGO_USER_CLIENT_URL = getOrThrow<string>(
  'store.mongo.benchmark.clientUrl',
);

export const DATA_USER_DATABASE = getOrThrow<DbConfig>(
  'store.mongo.benchmark',
);

export const LIST_DB: Array<DbConfig> = [DATA_USER_DATABASE];
