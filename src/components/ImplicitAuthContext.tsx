import { createContext, useContext } from 'react';

import type { AdaptersApi } from '../adapters/types';

export const ImplicitAuthContext = createContext<AdaptersApi>(undefined);

export const useImplicitAuth = () => {
  const implicitAuthContext = useContext(ImplicitAuthContext);

  if (!implicitAuthContext) {
    throw new Error(
      `ImplicitAuthContext is undefined, check if useImplicitAuthContext() called in <ImplicitAuthProvider /> child component.`,
    );
  }

  return implicitAuthContext;
};

export const ImplicitAuthConsumer = ImplicitAuthContext.Consumer;
