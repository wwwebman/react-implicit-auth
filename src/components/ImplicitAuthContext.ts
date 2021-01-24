import { createContext } from 'react';

import type { AdaptersApi } from '../adapters/types';

const ImplicitAuthContext = createContext<AdaptersApi>(undefined);

export default ImplicitAuthContext;
