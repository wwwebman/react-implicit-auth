import { AdapterId } from '../adapters/types';

interface StatusValues {
  message: string;
  event: string;
  adapterId: AdapterId;
  type: 'error' | 'success';
  status?: string | number;
}

const createStatus = ({
  adapterId,
  event,
  message,
  status = 'UNSPECIFIED',
  type,
}: StatusValues): StatusValues => {
  return {
    adapterId,
    event,
    message,
    status,
    type,
  };
};

export default createStatus;
