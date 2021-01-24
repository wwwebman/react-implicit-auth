Be sure the hook gets called as a child of `<ImplicitAuthProvider />`.

```tsx static
import { useImplicitAuth, ImplicitAuthProvider } from 'react-implicit-auth';

const FacebookLoginButton = () => {
  const auth = useImplicitAuth();

  return <button onClick={() => auth.facebook.login()}>{children}</button>;
};

const App = () => {
  const auth = useImplicitAuth();

  return (
    <ImplicitAuthProvider
      configs={{
        facebook: {
          debug: true,
          appId: '****************',
          cookie: true,
          version: 'v9.0',
          xfbml: false,
        },
      }}
    >
      <FacebookLoginButton />
    </ImplicitAuthProvider>
  );
};
```

Basically, `useImplicitAuth()` does the following to simplify end-user usage:

```tsx static
import { useContext } from 'react';
import { ImplicitAuthContext } from 'react-implicit-auth';

const FacebookLoginButton = () => {
  const auth = useContext(ImplicitAuthContext);

  return <button onClick={() => auth.facebook.login()}>{children}</button>;
};
```

