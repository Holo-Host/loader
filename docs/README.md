# Holo.host Loader Tools

This repo contains a collection of components that are used to bootstrap a running Holo UI in the users browser

**hLoader** is the HTML and script that the browser first loads when visiting a Holo enabled URL. This then boostraps the rest of the application by retrieving the hApp UI HTML, injecting the hClient scripts and UI components and finally replacing the current document with the app HTML.

**hClient** is the client side library developers must import for their web UI to be Holo enabled. It includes the following functionality:
    - Key management and generation
        + Generating temporary readonly keys for browsing
        + Detecting when authorization is required and prompting the user to signup/login to generate read/write keys
    - Signing calls and responses
    - setting up a websocket connection to the interceptor to sign commits on request
    -  Wrapping and unwrapping calls to and from the interceptor such that they look like regular holochain calls

hClient is designed so that UI developers do not need to make any extra considerations when developing for Holo or Holochain. A holochain app that uses hc-web-client can be converted to holo by calling

```javascript
const hClient = require("hClient");
const holochainClient = require("@holochain/hc-web-client");

holoClient = hClient.makeWebClient(window.holochainclient);
```

This will return an API compatible holoClient object to make calls with but will included all the relevent hooks to be holo enabled.

---

The final piece is the login modal. This can be injected into the app UI by calling

```
hClient.insertLoginHtml();
hClient.registerLoginCallbacks();
```

This has its own inline scoped CSS and should not interfere with the rest of the application. hClient is then able to trigger this modal to block any further user interaction until they are authenticated.

Test sites:

- https://hello.artflow.network - will return working hApp (proto, if no results are returned then probably hcdev server died)


