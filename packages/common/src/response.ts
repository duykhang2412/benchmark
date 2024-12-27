import { Context, TypedResponse } from 'hono';
import { StatusCode } from 'hono/utils/http-status';
import {
  InvalidJSONValue,
  JSONParsed,
  JSONValue,
  SimplifyDeepArray,
} from 'hono/utils/types';
import { IValidation, tags } from 'typia';

export interface IResponse<T> {
  ok: boolean;
  data: null | T;
  meta?: null | IResponse.IMetadata;
  error?: null | IResponse.IError;
}

export namespace IResponse {
  export interface IMetadata {
    itemsPerPage: number & tags.Type<'int32'>;
    totalItems: number & tags.Type<'int32'>;
    totalPages: number & tags.Type<'int32'>;
    currentPage: number & tags.Type<'int32'>;
  }

  export interface IError {
    code: string;
    message: string;
    details?: null | IValidation.IError[];
  }

  export interface IErrorResponse {
    ok: false;
    data?: null;
    meta?: null;
    error?: IError;
  }

  export const SCHEMA_REF = {
    RESPONSE: '#/components/schemas/IResponse',
    ERROR_RESPONSE: '#/components/schemas/IResponse.IErrorResponse',
    ERROR: '#/components/schemas/IResponse.IError',
  };
}

type JSONRespondReturn<
  T extends JSONValue | SimplifyDeepArray<unknown> | InvalidJSONValue,
  U extends StatusCode,
> = Response &
  TypedResponse<
    SimplifyDeepArray<T> extends JSONValue
      ? JSONValue extends SimplifyDeepArray<T>
        ? never
        : JSONParsed<T>
      : never,
    U,
    'json'
  >;

export const success = <T>(
  c: Context,
  data: T,
  status: StatusCode,
  meta?: null | IResponse.IMetadata,
): JSONRespondReturn<IResponse<T>, StatusCode> => {
  const response: IResponse<T> = { ok: true, data, meta };
  return c.json(response, status);
};

export const fail = (
  c: Context,
  error?: IResponse.IError,
  status?: StatusCode,
): JSONRespondReturn<IResponse.IErrorResponse, StatusCode> => {
  const response: IResponse.IErrorResponse = {
    ok: false,
    data: null,
    meta: null,
    error,
  };
  return c.json(response, status);
};
