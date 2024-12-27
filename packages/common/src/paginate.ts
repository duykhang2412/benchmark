import { Collection, Filter, FindOptions } from 'mongodb';
import { tags } from 'typia';

import { IResponse } from './response';

export namespace IPaginate {
  export interface IRequest {
    limit?: number & tags.Type<'int32'>;
    page?: number & tags.Type<'int32'>;
  }

  export interface IData {
    data: any[];
  }

  export const SCHEMA_REF = {
    PARAMETERS: [
      {
        name: 'page',
        in: 'query',
        required: false,
        schema: {
          type: 'number',
        },
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: {
          type: 'number',
        },
      },
    ],
  };
}

export async function paginate<T>(
  collection: Collection<any>,
  dto: IPaginate.IRequest,
  filter: Filter<T> = {},
  options: FindOptions = {},
): Promise<IResponse<any>> {
  const { limit = 10, page = 1 } = dto;

  const totalItems = await collection.countDocuments(filter);
  const totalPages = Math.ceil(totalItems / limit);
  const offset = (page - 1) * limit;

  const data = await collection
    .find(filter, options)
    .skip(offset)
    .limit(limit)
    .toArray();

  return {
    ok: true,
    data,
    meta: {
      itemsPerPage: limit,
      totalItems,
      totalPages,
      currentPage: page,
    },
  };
}
