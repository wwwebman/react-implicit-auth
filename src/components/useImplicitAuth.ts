import { useContext } from 'react';
import ImplicitAuthContext from './ImplicitAuthContext';

/**
 * A custom React hook that returns API passed by `<ImplicitAuthProvider />`.
 * @visibleName useImplicitAuth()
 */
export const useImplicitAuth = () => {
  const implicitAuthContext = useContext(ImplicitAuthContext);

  if (!implicitAuthContext) {
    throw new Error(
      `useImplicitAuth() must be used within ImplicitAuthProvider.`,
    );
  }

  return implicitAuthContext;
};

/** @component */
export default useImplicitAuth;
