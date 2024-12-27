import { sendUnaryData } from '@grpc/grpc-js';
import { IValidation } from 'typia';

import { mapErrorsToMessages } from './map-error-to-message';

export function handleError(
  validateResult: IValidation,
  callback: sendUnaryData<any>,
): boolean {
  if (validateResult.errors.length > 0) {
    callback(null, {
      ok: false,
      error: {
        code: 1000,
        details: mapErrorsToMessages(validateResult.errors),
      },
    });

    return false;
  }

  return true;
}
