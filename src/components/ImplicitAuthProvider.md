`<ImplicitAuthProvider />` is a component that registers, loads, and creates unify social SDK methods.
At the moment it handles the following SDK:

- facebook
- google

Put `<ImplicitAuthProvider />` somewhere high in your app, above components that might use its API:

```tsx static
import { ImplicitAuthProvider } from 'react-implicit-auth';
import MyPage from './MyPage'

const handleAuthProviderError = (error) => {
  console.error(error);
}
const handleAuthProviderSuccess = (data) => {
  console.log(data);
}

const MyApp = () => (
  <ImplicitAuthProvider
    onInitError={handleAuthProviderError}
    onAutoLoginError={handleAuthProviderError}
    onAutoLoginSuccess={handleAuthProviderSuccess}
    onInitSuccess={handleAuthProviderSuccess}
    config={{
      facebook: {
        debug: true,
        appId: '****************',
        cookie: true,
        version: 'v9.0',
        xfbml: false,
      },
      google: {
        clientId: '*****.apps.googleusercontent.com',
        scope: 'profile email',
      },
    }}
  >
    <MyPage />
  </ImplicitAuthProvider>
);

export default MyApp;
```
