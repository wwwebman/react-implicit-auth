In the following examples you check how methods works.

## Config

```tsx noeditor
import { useState } from 'react';

const jsonParse = (json) => {
  try {
    return JSON.parse(json);
  } catch (e) {
    alert('JSON is not valid!');
    return null;
  }
};
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
const [config, setConfig] = useState(() => {
  return jsonParse(localStorage.getItem('savedConfig')) || defaultConfig;
});
const handleSubmit = (e) => {
  e.preventDefault();
  localStorage.setItem('savedConfig', JSON.stringify(config));
  window.location.reload();
};

<>
  <form onSubmit={handleSubmit}>
    <textarea
      value={JSON.stringify(config, null, 2)}
      style={{ width: '100%' }}
      rows={13}
      name="test"
      onChange={(e) => setConfig(jsonParse(e.target.value) || config)}
    />
    <button type="submit" disabled={config === defaultConfig}>
      Save Config
    </button>
  </form>
</>;
```

## api()

```tsx
```
