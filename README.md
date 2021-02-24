<div align="center">
  <a href="https://webman.pro">
    <img alt="react-implicit-auth" src="/logo.svg" width="100px"  />
  </a>
  <h1 align="center">React Implicit Authorization</h1>
  <a href="https://www.npmjs.org/package/react-implicit-auth">
    <img src="https://img.shields.io/npm/v/react-implicit-auth.svg" alt="npm">
  </a>
  <a href="https://bundlephobia.com/result?p=react-implicit-auth">
    <img src="https://img.shields.io/bundlephobia/min/react-implicit-auth?color=green" alt="bundlephobia">
  </a>
  <a href="https://github.com/wwwebman/react-implicit-auth/blob/master/CONTRIBUTING.md">
    <img src="https://img.shields.io/badge/contributions-welcome-brightgreen?color=green" alt="Contributions">
  </a>
  <a href="https://github.com/wwwebman/react-implicit-auth/blob/master/LICENSE">
    <img src="https://img.shields.io/github/license/mashape/apistatus" alt="License">
  </a>
  <a href="https://react-implicit-auth.webman.pro/#examples">
    <img src="https://img.shields.io/badge/examples-🚀-9cf" alt="examples" />
  </a>
</div>
<br />

React Implicit Authorization is a React Provider component that simplifies the [implicit grant flow](https://oauth.net/2/grant-types/implicit/#:~:text=The%20Implicit%20flow%20was%20a,extra%20authorization%20code%20exchange%20step.)
authorization and authentication process using the following social API providers:

- [facebook](https://developers.facebook.com/docs/javascript)
- [google](https://github.com/google/google-api-javascript-client)

Technically it's a wrapper on top of the SDK interface delivered by social providers.

Read [docs](https://react-implicit-auth.webman.pro/) for more details.

[![docs build netlify](https://api.netlify.com/api/v1/badges/5ab989fd-4735-4f4c-a1be-7616fb1dc7ff/deploy-status)](https://app.netlify.com/sites/react-implicit-auth/deploys)

## Install

```bash
$ npm install react-implicit-auth
```

```bash
$ yarn add react-implicit-auth
```

## Motivation

The main idea is to unify the social provides API interface and solve the following problems:

- A different methods naming, API usage, responses.
  The component tries to solve issue unifying stuff
- A complex documentation.
  Using the component you save time for testing and reading docs
- A lack of auto initialization.
  The component allows you to append SDK scripts and initialize them based on the configuration you provide

## Docs

See the documentation for more information about using react-implicit-auth package.

- [ImplicitAuthProvider](https://react-implicit-auth.webman.pro/#implicitauthprovider)
- [Context Methods](https://react-implicit-auth.webman.pro/#methods)
- [useImplicitAuth()](https://react-implicit-auth.webman.pro/#useimplicitauth)

## Troubleshooting

<details>
<summary>After running yarn start browser complains that "your connection is not secure"?</summary>

Ignore it and add an exception for this page.
The page should have `https` to make because most of the providers require it.

</details>

<details>
<summary>Google login doesn't work in incognito mode?</summary>

This is one of the limitations of the implicit grant flow.
Google login might not work in incognito mode or when third-party cookies are blocked: [issue](https://developers.google.com/identity/sign-in/web/troubleshooting).

</details>

## Contributing

If you want to contribute to react-implicit-auth please see the contributing [guideline](https://github.com/wwwebman/react-implicit-auth/blob/master/CONTRIBUTING.md).
