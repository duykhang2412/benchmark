import { Context } from 'hono';
import { StatusCode } from 'hono/utils/http-status';
import { IValidation } from 'typia';

import { IResponse } from './response';

export type IResult = {
  success: boolean;
  body?: any;
  param?: any;
  query?: any;
  error?: IResponse.IError;
  status?: StatusCode;
};

export const parseErrorFromTypiaErrors = (
  errors: IValidation.IError[],
): string[] => errors.map((error) => error.path);

export const bodyValidate = async (
  c: Context,
  validateFn: (input: any) => IValidation.IFailure | IValidation.ISuccess,
): Promise<IResult> => {
  let body: Record<string, unknown> | undefined;

  try {
    body = await c.req.json();
  } catch (error) {
    body = undefined;
  }

  const result = validateFn(body);
  return {
    success: result.success,
    body,
    error: {
      code: 'INVALID_BODY',
      message: 'Invalid body',
      details: result.errors,
    },
    status: 400,
  };
};

export const sourceIdValidate = (c: Context): IResult => {
  const id = Number(c.req.param('sourceId'));
  if (isNaN(id)) {
    return {
      success: false,
      error: {
        code: 'INVALID_SOURCE_ID',
        message: 'Invalid sourceId',
      },
      status: 400,
    };
  }
  return {
    success: true,
    param: id,
  };
};

export const queryValidate = (
  c: Context,
  validateFn: (input: any) => IValidation.IFailure | IValidation.ISuccess,
): IResult => {
  const query = c.req.query();
  const urlSearchParams = new URLSearchParams(query);
  const result = validateFn(urlSearchParams);
  if (!result.success)
    return {
      success: false,
      error: {
        code: 'INVALID_QUERY',
        message: 'Invalid query',
      },
      status: 400,
    };

  // Convert numeric strings to numbers in the query
  const convertedQuery: { [key: string]: string | number } = {};
  urlSearchParams.forEach((value, key) => {
    const numberValue = Number(value);
    convertedQuery[key] = isNaN(numberValue) ? value : numberValue;
  });

  return {
    success: true,
    query: convertedQuery,
  };
};
