import { MethodResult } from '../adapters/types';

const createMethodResult = ({
  provider,
  event,
  message,
  status = 'UNSPECIFIED',
  type,
}: MethodResult) => {
  return {
    provider,
    event,
    message,
    status,
    type,
  };
};

export default createMethodResult;
