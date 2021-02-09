## Examples

### Config

The config object gets distributed to each provider's adapter.
You can modify the configuration or use the existing one.
The configuration modification gets synchronized with local storage.
Don't be afraid to refresh the page if you need.

```jsx noeditor
import ImplicitAuthContext from './ImplicitAuthContext';
import ImplicitAuthProvider from './ImplicitAuthProvider';
import ReactJson from 'react-json-view';
import Tooltip from '@material-ui/core/Tooltip';
import { useEffect, useRef, useState, useMemo } from 'react';
import Fab from '@material-ui/core/Fab';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import RefreshIcon from '@material-ui/icons/Refresh';
import LinearProgress from '@material-ui/core/LinearProgress';

const defaultConfig = useMemo(
  () =>
    JSON.stringify({
      facebook: {
        debug: true,
        appId: '****************',
        cookie: true,
        version: 'v9.0',
        xfbml: true,
      },
      google: {
        clientId: '*.apps.googleusercontent.com',
        scope: 'profile email',
      },
    }),
  [],
);
const configFromStorage = useMemo(() =>
  JSON.parse(localStorage.getItem('config') || defaultConfig, []),
);
const [configUpdated, setConfigUpdated] = useState(false);
const [modifiedArgs, setModifiedArgs] = useState(false);
const [authData, setAuthData] = useState({});
const [responses, setResponses] = useState({});

const handleConfigChange = ({ updated_src }) => {
  const newConfig = JSON.stringify(updated_src);

  localStorage.setItem('config', JSON.stringify(updated_src));

  if (JSON.stringify(configFromStorage) !== newConfig) {
    setConfigUpdated(true);
  }
};

const handleArgsChange = (key) => ({ updated_src }) => {
  setModifiedArgs({ ...modifiedArgs, [key]: updated_src });
};

const handleExecuteCall = (key, cb, args) => async () => {
  setResponses((state) => ({
    ...state,
    [key]: {
      loading: true,
    },
  }));

  try {
    const data = await cb(modifiedArgs[key] || args);
    setResponses((state) => ({
      ...state,
      [key]: {
        response: data,
        loading: false,
      },
    }));
  } catch (error) {
    setResponses((state) => ({
      ...state,
      [key]: {
        response: error,
        loading: false,
      },
    }));
  }
};

const handleInitError = (error) => {
  alert(JSON.stringify(error, null, 2));
};

<ImplicitAuthProvider config={configFromStorage} onInitError={handleInitError}>
  <ImplicitAuthContext.Consumer>
    {(auth) => {
      const methods = {
        login: {
          facebook: { func: () => auth.facebook.login() },
          google: { func: () => auth.google.login() },
        },
        getUserProfile: {
          facebook: { func: () => auth.facebook.getUserProfile() },
          google: { func: () => auth.google.getUserProfile() },
        },
        grant: {
          facebook: { func: () => auth.facebook.grant() },
          google: {
            func: (args) => auth.google.grant(args),
            args: { scope: 'https://www.googleapis.com/auth/user.gender.read' },
          },
        },
        api: {
          facebook: {
            func: () => auth.facebook.api(),
            args: { path: '' },
          },
          google: {
            func: (args) => auth.google.api(args),
            args: {
              path: 'https://people.googleapis.com/v1/people/me',
              params: { personFields: 'names' },
            },
          },
        },
        logout: {
          facebook: { func: () => auth.facebook.logout() },
          google: { func: () => auth.google.logout() },
        },
        revoke: {
          facebook: { func: () => auth.facebook.revoke() },
          google: { func: () => auth.google.revoke() },
        },
        autoLogin: {
          facebook: { func: () => auth.facebook.autoLogin() },
          google: { func: () => auth.google.autoLogin() },
        },
        init: {
          facebook: { func: () => auth.facebook.init(), execute: false },
          google: { func: () => auth.google.init(), execute: false },
          description: `The method gets called on the ImplicitAuthProvider mount phase. In most cases, you don't have to call it manually, but if you want to, use the following.`,
        },
      };

      return (
        <>
          <div style={{ position: 'relative' }}>
            <ReactJson
              indentWidth={4}
              name={false}
              onAdd={handleConfigChange}
              onDelete={handleConfigChange}
              onEdit={handleConfigChange}
              src={configFromStorage}
              style={{ margin: '20px 0' }}
              collapseStringsAfterLength={35}
            />
            {configUpdated && (
              <div style={{ position: 'absolute', top: 0, right: 0 }}>
                <Tooltip title="Config change requires a page refresh to init providers SDK using the new configuration.">
                  <Fab
                    size="medium"
                    color="secondary"
                    onClick={() => location.reload()}
                  >
                    <RefreshIcon />
                  </Fab>
                </Tooltip>
              </div>
            )}
          </div>
          <h2>Core Methods</h2>
          {Object.keys(methods).map((methodName) => (
            <Paper
              key={methodName}
              style={{
                margin: '20px 0',
                padding: '10px 20px 10px',
              }}
            >
              <h3>{methodName}()</h3>
              <small>{methods[methodName].description}</small>
              {Object.keys(configFromStorage).map((provider) => {
                const key = methodName + provider;
                const entry = methods[methodName][provider];
                const execute = !(entry.execute === false);
                const method = entry.func;
                const args = entry.args;
                const methodExecutionExample = /return([\s\S]*?)\;/.exec(
                  method.toString(),
                )[1];

                return (
                  <div
                    key={key}
                    style={{
                      border: '1px #ccc solid',
                      margin: '10px 0',
                      background: '#f7fdff',
                    }}
                  >
                    <Box
                      alignItems="center"
                      display="flex"
                      justifyContent="space-between"
                      px={1}
                    >
                      <pre>{methodExecutionExample}</pre>
                      {execute && (
                        <Button
                          type="button"
                          onClick={handleExecuteCall(key, method, args)}
                        >
                          Execute
                        </Button>
                      )}
                    </Box>
                    {args && (
                      <ReactJson
                        indentWidth={4}
                        name={'args'}
                        src={modifiedArgs[key] || args}
                        style={{ padding: '10px 20px 20px' }}
                        onEdit={handleArgsChange(key)}
                      />
                    )}
                    {responses[key] && !responses[key].loading && (
                      <ReactJson
                        collapseStringsAfterLength={35}
                        indentWidth={4}
                        name={false}
                        src={responses[key].response}
                        style={{ padding: 20 }}
                        theme="harmonic"
                      />
                    )}
                    {responses[key] && responses[key].loading && (
                      <LinearProgress />
                    )}
                  </div>
                );
              })}
            </Paper>
          ))}
        </>
      );
    }}
  </ImplicitAuthContext.Consumer>
</ImplicitAuthProvider>;
```

### Event Methods

Beside core methods the `ImplicitAuthProvider` component passes **event** emitter methods.
The emitter functionality comes from **mitt** - event emitter library.
The API documentation you can find [here](https://github.com/developit/mitt#api).

##### When it can be helpful?

If you call core methods in multiple places but store data in a root component
the events listening might be a good solution.

A core method call causes the event gets triggered("login", "logout", etc.).
Also there a special **error** event which occurs when a core method call crashes.

##### Example

```jsx static
import { useImplicitAuth } from 'react-implicit-auth';

/**
 * Don't forget to put the following component as child of `ImplicitAuthProvider`.
 */
const Root = () => {
  const auth = useImplicitAuth();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const handleLoginEvent = async () => {
      const user = await auth.getUserProfile();

      setUser(user.data);
    };

    const handleLogoutEvent = async () => {
      setUser(null);
    };

    /**
     * If autoLogin is failed it makes sense to redirect a user
     * to the login view.
     */
    const handleErrorEvent = ({ event }) => {
      if (event === 'autoLogin') {
        router.push('/login');
      }
    };

    authClient?.on?.('login', handleLoginEvent);
    authClient?.on?.('autoLogin', handleLoginEvent);
    authClient?.on?.('logout', handleLogoutEvent);
    authClient?.on?.('error', handleErrorEvent);

    return () => {
      authClient?.off?.('login', handleLoginEvent);
      authClient?.off?.('autoLogin', handleLoginEvent);
      authClient?.on?.('logout', handleLogoutEvent);
      authClient?.off?.('error', handleErrorEvent);
    };
  }, [authClient]);

  return <>{user && <span>Hello, {user.name}</span>}</>;
};

export default Root;
```

I hope you got the idea.
In this example you see the global component that can react on every login/logout and keep this data in its state.
