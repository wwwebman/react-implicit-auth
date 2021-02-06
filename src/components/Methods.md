## Examples

### Config

The config object is **required**.
You can modify it to your own configuration.
Otherwise, feel free to use the existing one:

```jsx noeditor
import ImplicitAuthContext from './ImplicitAuthContext';
import ImplicitAuthProvider from './ImplicitAuthProvider';
import ReactJson from 'react-json-view';
import Tooltip from '@material-ui/core/Tooltip';
import { useEffect, useRef, useState, useMemo } from 'react';

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
const [configFromStorage, setConfig] = useState(() =>
  JSON.parse(localStorage.getItem('config') || defaultConfig),
);
const [authFromStorage, setAuth] = useState(() =>
  JSON.parse(localStorage.getItem('auth') || '{}'),
);
const [responses, setResponses] = useState({});

const handleConfigChange = ({ updated_src }) => {
  setConfig(updated_src);
  localStorage.setItem('config', JSON.stringify(updated_src));
};

const handleLoginSuccess = (provider) => (result) => {
  setAuth({ ...authFromStorage, [provider]: result });
  localStorage.setItem('auth', JSON.stringify(authFromStorage));
};

<ImplicitAuthProvider config={configFromStorage}>
  <ReactJson
    indentWidth={4}
    name={false}
    onAdd={handleConfigChange}
    onDelete={handleConfigChange}
    onEdit={handleConfigChange}
    src={configFromStorage}
    style={{ margin: '20px 0' }}
  />
  <ImplicitAuthContext.Consumer>
    {(auth) => {
      const methods = {
        api: {
          facebook: () => auth.facebook.api({ path: '' }),
          google: () => auth.google.api({ path: '' }),
        },
        autoLogin: {
          facebook: () => auth.facebook.autoLogin(),
          google: () => auth.google.autoLogin(),
        },
        getUserProfile: {
          facebook: () => auth.facebook.getUserProfile(),
          google: () => auth.google.getUserProfile(),
        },
        grant: {
          facebook: () => auth.facebook.grant(),
          google: () => auth.google.grant(),
        },
        init: {
          facebook: () => auth.facebook.init(),
          google: () => auth.google.init(),
        },
        login: {
          facebook: () => auth.facebook.login(),
          google: () => auth.google.login(),
        },
        logout: {
          facebook: () => auth.facebook.logout(),
          google: () => auth.google.logout(),
        },
        revoke: {
          facebook: () => auth.facebook.revoke(),
          google: () => auth.google.revoke(),
        },
      };

      return (
        <>
          {Object.keys(configFromStorage).map((provider) => (
            <button
              key={provider}
              onClick={() =>
                auth[provider]
                  .login()
                  .then(handleLoginSuccess(provider), (error) => {
                    alert(
                      `A ${provider} login error occurred. Error details: ${JSON.stringify(
                        error,
                        null,
                        2,
                      )}`,
                    );
                  })
              }
              type="button"
              style={{ margin: 5 }}
            >
              {authFromStorage[provider] && <>&#10003;</>} Login {provider}
            </button>
          ))}
          <h3>Methods usage</h3>
          {Object.keys(methods).map((method) => (
            <div
              key={method}
              style={{
                background: '#fcfcfc',
                border: '1px #ccc solid',
                margin: '20px 0',
                padding: '0 20px 10px',
              }}
            >
              <h3>{method}()</h3>
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
                        title={
                          !authFromStorage[provider] &&
                          `Make sure "Login ${provider}" clicked. Otherwise, call to get an error.`
                        }
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
                        name={false}
                        theme="harmonic"
                        src={responses[responsesKey].response}
                        indentWidth={4}
                        style={{ padding: 20 }}
                        collapseStringsAfterLength={40}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </>
      );
    }}
  </ImplicitAuthContext.Consumer>
</ImplicitAuthProvider>;
```
