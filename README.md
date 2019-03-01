# Holo.host Loader

This is Pre-Alpha software only for testing purposes.

## Description

This is a repository of the JavaScript tool which run on initial load of a web application running on Holo.Host P2P infrastructure.

Every Holo web application starts from the hLoader index.html and index.js. The loader function `initHapp` reads the current URL and uses this to query the resolver service for Hosts which can provide the static assets and also a holochain node for the app that is registered at this URL.

The resolved returns a collection of host URLs, currently the first one is selected.

The loader then retrieves the index.html for the desired web UI and replaces the html `<base>` tag such that additional assets are retrived from the host instead of the current URL. This is also used to configure the websocket connection in [hClient.js](https://github.com/Holo-Host/hClient.js/), the client side holo library, so that it can redirect holochain calls to the holo host.

After this the loader effectively erases itself by replacing the window HTML with that loaded from the host. The browser URL will continue to display the location where the loader was retrieved but by this stage all requests are directed to the host.

## Deployment

TODO: Set up automatic deployment to holo infrastructure
