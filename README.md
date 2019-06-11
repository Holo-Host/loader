# Holo.host Loader

This is Pre-Alpha software only for testing purposes.

## Description

This is a repository of the JavaScript tool which run on initial load of a web application running on Holo.Host P2P infrastructure.

Every Holo web application starts from the hLoader index.html and index.js. The loader function `initHapp` reads the current URL and uses this to query the resolver service for Hosts which can provide the static assets and also a holochain node for the app that is registered at this URL.

The resolved returns a collection of host URLs, currently the first one is selected.

The loader then loads content of the hApp into the iFrame. This is also used to configure the websocket connection in [hClient.js](https://github.com/Holo-Host/hClient.js/), the client side holo library, so that it can redirect holochain calls to the holo host.

In the next iteration iFrame will communicate with parent window to update page title, update url and handle browsing history.

## Development
- Set up simple local server exposing files from current directory eg. `python -m SimpleHTTPServer 8080`
- Head to `localhost:8080` which should serve you `index.html` - this is your loader
- Use `debug.html` to insert mocked resolver response and bypass it entirely


## Deployment

TODO: Set up automatic deployment to holo infrastructure
