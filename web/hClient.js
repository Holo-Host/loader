/**
 * hClient.js
 * An API compatible drop-in for hc-web-client
 * 
 * Exports a single function, overrideWebClient, that will instantly holo-ify a holochain app.
 * It adds the additional functionality of
 *     - Connecting to the correct holo-port
 *     - Signing all calls with the agents private key
 *     - Intercepting 401 responses to display a login screen
 */

const hClient = (function(){

    const overrideWebClient = (url) => {
        const holochainClient = win.holochainClient;
        
        win.holochainClient = {
            connect: holochainClient.connect(url)
        };
    }

    return {
        overrideWebClient
    };

})();
