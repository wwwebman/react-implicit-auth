Be sure the hook gets called as a child of `<ImplicitAuthProvider />`.

```tsx static
import { useImplicitAuth, ImplicitAuthProvider } from 'react-implicit-auth';

const FacebookLoginButton = () => {
  const auth = useImplicitAuth();

  return <button onClick={() => auth.facebook.login()}>{children}</button>;
};

const App = () => {
  return (
    <ImplicitAuthProvider
      onInitError={(e) => {
        alert(e);
      }}
      onAutoLoginError={(e) => {
        alert(e);
      }}
      config={{
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
