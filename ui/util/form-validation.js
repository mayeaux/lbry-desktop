// @flow
import { regexAddress, regexInvalidURI } from 'lbry-redux';

type DraftTxValues = {
  destination: string,
  // amount: number
};

export const validateSendTx = (formValues: DraftTxValues) => {
  const { destination } = formValues;
  const errors = {};

  // All we need to check is if the destination address or claim URI is valid
  // If values are missing, users wont' be able to submit the form
  if (!process.env.NO_ADDRESS_VALIDATION && !regexAddress.test(destination) && !regexInvalidURI.test(destination)) {
    errors.address = __('Not a valid LBRY address or URI');
  }

  return errors;
};
