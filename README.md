# Holo.host Loader

This is Pre-Alpha software only for testing purposes.

## Description

This is a branch of loader that locally mocks KV store and proxy behaviour. For full instruction how to set up your local Holo development environment go [here](https://hackmd.io/TlzylZCqR_GJ3Tjs5ZPvqQ).

If you're willing to use specific `bundel_hash` please update `index.html` to your needs. 

In the same maner the port that envoy is listening on for UI requests can be changed in `index.html`

## Dev server

To use the dev server you must modify your `/etc/hosts` to include the following:

    127.0.0.1       resolver.holohost.net

Then, run the dev server like so:

```
npm install
sudo npm start <HHA_ID>
```

where HHA_ID is the hash of the Holo Hosting App entry (the hostingAppId). The sudo is so that the server can run on port 80.
