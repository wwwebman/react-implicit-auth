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
import RefreshIcon from '@material-ui/icons/Refresh';

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
const [authData, setAuthData] = useState({});
const [responses, setResponses] = useState({});

const handleConfigChange = ({ updated_src }) => {
  const newConfig = JSON.stringify(updated_src);

  localStorage.setItem('config', JSON.stringify(updated_src));

  if (JSON.stringify(configFromStorage) !== newConfig) {
    setConfigUpdated(true);
  }
};

const handleInitError = (error) => {
  alert(JSON.stringify(error, null, 2));
};

<ImplicitAuthProvider
  config={configFromStorage}
  onInitError={handleInitError}
>
  <ImplicitAuthContext.Consumer>
    {(auth) => {
      const methods = {
        login: {
          facebook: () => auth.facebook.login(),
          google: () => auth.google.login(),
        },
        init: {
          facebook: () => auth.facebook.init(),
          google: () => auth.google.init(),
          description: `The method gets called on the ImplicitAuthProvider mount phase. You don't need to call manually it in most cases.`,
        },
        getUserProfile: {
          facebook: () => auth.facebook.getUserProfile(),
          google: () => auth.google.getUserProfile(),
        },
        grant: {
          facebook: () => auth.facebook.grant(),
          google: () => auth.google.grant(),
        },
        api: {
          facebook: () => auth.facebook.api({ path: '' }),
          google: () =>
            auth.google.api({
              path: 'https://people.googleapis.com/v1/people/me',
              params: { personFields: 'names' },
            }),
        },
        logout: {
          facebook: () => auth.facebook.logout(),
          google: () => auth.google.logout(),
        },
        revoke: {
          facebook: () => auth.facebook.revoke(),
          google: () => auth.google.revoke(),
        },
        autoLogin: {
          facebook: () => auth.facebook.autoLogin(),
          google: () => auth.google.autoLogin(),
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
          <h2>Methods</h2>
          <p>
            Using ImplicitAuthProvider the following methods get accessible in
            the React context.
          </p>
          {Object.keys(methods).map((method) => (
            <Paper
              key={method}
              style={{
                margin: '20px 0',
                padding: '10px 20px 10px',
              }}
            >
              <h3>{method}()</h3>
              <small>{methods[method].description}</small>
              {Object.keys(configFromStorage).map((provider) => {
                const responsesKey = method + provider;
                const methodExecution = methods[method][provider].toString();
                const methodExecutionExample = /return([\s\S]*?)\;/.exec(
                  methodExecution,
                )[1];

                return (
                  <div
                    key={provider}
                    style={{
                      border: '1px #ccc solid',
                      margin: '20px 0 10px',
                      background: '#f7fdff',
                    }}
                  >
                    <div
                      style={{
                        alignItems: 'flex-start',
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: 10,
                      }}
                    >
                      <pre>{methodExecutionExample}</pre>
                      <Tooltip
                        title={`Make sure "Login ${provider}" clicked. Otherwise, call to get an error.`}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            methods[method][provider]().then(
                              (data) => {
                                setResponses((state) => ({
                                  ...state,
                                  [responsesKey]: {
                                    response: data,
                                    type: 'SUCCESS',
                                  },
                                }));
                              },
                              (error) => {
                                setResponses((state) => ({
                                  ...state,
                                  [responsesKey]: {
                                    response: error,
                                    type: 'ERROR',
                                  },
                                }));
                              },
                            )
                          }
                        >
                          Execute
                        </button>
                      </Tooltip>
                    </div>
                    {responses[responsesKey] && (
                      <ReactJson
                        collapseStringsAfterLength={35}
                        indentWidth={4}
                        name={false}
                        src={responses[responsesKey].response}
                        style={{ padding: 20 }}
                        theme="harmonic"
                      />
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

### Events

There are special circumstances when listening to the events is more convenient or even required.
The `ImplicitAuthProvider` component besides regular methods passes event methods.
For this purpose used a tiny event emitter - [mitt](https://github.com/developit/mitt).
