## Examples

In the following examples you check how methods works.

### Config

```jsx noeditor
import { useEffect, useRef, useState } from 'react';
import ImplicitAuthProvider from './ImplicitAuthProvider';
import ImplicitAuthContext from './ImplicitAuthContext';

const defaultConfig = {
  facebook: {
    debug: true,
    appId: '****************',
    cookie: true,
    version: 'v9.0',
    xfbml: false,
  },
  google: {
    clientId: '*.apps.googleusercontent.com',
    scope: 'profile email',
  },
};
const textAreaRef = useRef();
const config =
  localStorage.getItem('config') || JSON.stringify(defaultConfig, null, 2);

const handleSubmit = (e) => {
  e.preventDefault();

  try {
    const textAreaValue = textAreaRef.current.value;
    JSON.parse(textAreaValue);
    localStorage.setItem('config', textAreaValue);

    /**
     * The page refresh allows getting data from
     * localStorage in the examples below.
     */
    window.location.reload();
  } catch (e) {
    alert('Config JSON is not valid! Please fix it before saving.');
  }
};

const handleKeyDown = (e) => {
  if (e.ctrlKey && e.keyCode === 83) {
    handleSubmit(e);
  }
};

<ImplicitAuthProvider configs={JSON.parse(config)}>
  <form onSubmit={handleSubmit}>
    <textarea
      defaultValue={config}
      style={{ width: '100%' }}
      rows={13}
      ref={textAreaRef}
      onKeyDown={handleKeyDown}
    />
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}
    >
      <div style={{ maxWidth: 320 }}>
        <ImplicitAuthContext.Consumer>
          {(auth) =>
            Object.keys(JSON.parse(config)).map((provider) => (
              <button
                key={provider}
                onClick={auth[provider].login}
                type="button"
                style={{ margin: 3 }}
              >
                Login {provider}
              </button>
            ))
          }
        </ImplicitAuthContext.Consumer>
      </div>
      <button disabled={config === defaultConfig} type="submit">
        Save Config
      </button>
    </div>
  </form>
</ImplicitAuthProvider>;
```

```jsx noeditor
import { useEffect, useRef, useState } from 'react';
import ImplicitAuthProvider from './ImplicitAuthProvider';
import ImplicitAuthContext from './ImplicitAuthContext';

const [responses, setResponses] = useState({});
const config = localStorage.getItem('config') || '{}';

<ImplicitAuthProvider configs={JSON.parse(config)}>
  <ImplicitAuthContext.Consumer>
    {(auth) => {
      const methods = {
        api: {
          facebook() {
            return auth.facebook.api({ path: '' });
          },
          google() {
            return auth.google.api({ path: '' });
          },
        },
        autoLogin: {
          facebook() {
            return auth.facebook.autoLogin();
          },
          google() {
            return auth.google.autoLogin();
          },
        },
        getUserProfile: {
          facebook() {
            return auth.facebook.getUserProfile();
          },
          google() {
            return auth.google.getUserProfile();
          },
        },
        grant: {
          facebook() {
            return auth.facebook.grant();
          },
          google() {
            return auth.google.grant();
          },
        },
        init: {
          facebook() {
            return auth.facebook.init();
          },
          google() {
            return auth.google.init();
          },
        },
        login: {
          facebook() {
            return auth.facebook.login();
          },
          google() {
            return auth.google.login();
          },
        },
        logout: {
          facebook() {
            return auth.facebook.logout();
          },
          google() {
            return auth.google.logout();
          },
        },
        revoke: {
          facebook() {
            return auth.facebook.revoke();
          },
          google() {
            return auth.google.revoke();
          },
        },
      };

      return Object.keys(methods).map((method) => (
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
          {Object.keys(JSON.parse(config)).map((provider) => {
            const responsesKey = method + provider;

            return (
              <div
                key={provider}
                style={{
                  border: '1px #ccc solid',
                  margin: '10px 0',
                  background: '#f7fdff'
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
                  <pre>{`${methods[method][provider]}`}</pre>
                  <button
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
                    style={{ margin: 3 }}
                    type="button"
                  >
                    Execute
                  </button>
                </div>
                {responses[responsesKey] && (
                  <div>
                    <div
                      style={{
                        background:
                          responses[responsesKey].type === 'ERROR'
                            ? '#ffcccc'
                            : '#c0ffcf',
                        padding: 10,
                      }}
                    >
                      {responses[responsesKey].type}:
                    </div>
                    <pre
                      style={{
                        background:
                          responses[responsesKey].type === 'ERROR'
                            ? '#ffebeb'
                            : '#d4edda',
                        margin: 0,
                        overflow: 'auto',
                        padding: 10,
                      }}
                    >
                      {JSON.stringify(
                        responses[responsesKey].response,
                        null,
                        2,
                      )}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ));
    }}
  </ImplicitAuthContext.Consumer>
</ImplicitAuthProvider>;
```
