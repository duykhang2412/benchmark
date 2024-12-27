import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { logger } from '@packages/common';
import { dirname } from 'path';
import { cwd } from 'process';

import { PACKAGE, GRPC_PORT, VERSION } from '../constraint';
import { initDB } from '../store/models/user.model';
import { UserController } from './user.controller';

const server = new grpc.Server();

(async () => {
  await initDB();
})();

const protoPath = [
  require.resolve(`${cwd()}/proto/user.proto`),
];
console.log('protoPath', protoPath);

const includeDirs = [
  dirname(require.resolve('google-proto-files/package.json')),
  dirname(require.resolve(`${cwd()}/package.json`)),
];

// Load proto
const packageDefinition = protoLoader.loadSync(protoPath, {
  defaults: true,
  includeDirs,
});

const proto = grpc.loadPackageDefinition(packageDefinition).user as any;

server.addService(
  proto.UserServiceInternal.service,
  {
    ...UserController,
  },
);

server.bindAsync(
  `0.0.0.0:${GRPC_PORT}`,
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) {
      console.error('Failed to start server:', err);
      return;
    }

    logger.info(`${PACKAGE}@${VERSION} started at port ${GRPC_PORT}`);
  },
);
