import { MethodResult } from '../adapters/types';

const createMethodResult = ({
  data,
  event,
  message = '',
  provider,
  status = 'UNSPECIFIED',
  type,
}: MethodResult): MethodResult => ({
  data,
  event,
  message,
  provider,
  status,
  type,
});

export default createMethodResult;
