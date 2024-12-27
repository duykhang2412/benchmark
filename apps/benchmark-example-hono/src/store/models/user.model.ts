// SetupDB
import { Collection } from 'mongodb';

import { DATA_USER_DATABASE } from '../../constraint';
import { getCollection, setupDB } from '../mongo-db';
import { UserEntity } from '../entities/user.entity';

export let UserCollection: Collection<UserEntity>;

export async function initDB(): Promise<void> {
  const [_, DATABASE] = await setupDB(
    DATA_USER_DATABASE.clientUrl,
    DATA_USER_DATABASE.dbName,
  );

  UserCollection = getCollection<UserEntity>(
    DATABASE,
    DATA_USER_DATABASE.collectionName,
  );
}
