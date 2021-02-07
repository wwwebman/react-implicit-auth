import { createContext } from 'react';

import type { AdaptersApi } from '../adapters/types';

type ImplicitAuthContextProps = AdaptersApi;

const ImplicitAuthContext = createContext<ImplicitAuthContextProps>(undefined);

export default ImplicitAuthContext;
