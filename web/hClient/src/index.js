require('babel-polyfill');
/**
 * hClient.js
 * An API compatible drop-in for hc-web-client. This is inserted by the loader on page load and overrideWebClient() called
 * 
 * Exports a single function, overrideWebClient, that will instantly holo-ify a holochain app.
 * It adds the additional functionality of
 *     - Connecting to the correct holo-port
 *     - Signing all calls with the agents private key
 *     - Intercepting 401 responses to display a login screen
 */

module.exports = hClient = (function(){

    const { generateNewReadwriteKeypair } = require("./keyManagement");

    /**
     * Wraps and overwrites the current holochainClient attached to the window
     * Keeps the same functionaltiy but adds preCall and postCall hooks and also forces
     * connect to go to a given URL
     *
     * @param      {<type>}    url       The url to connect to
     * @param      {Function}  preCall   The pre call funciton. Takes the callString and params and returns new callString and params
     * @param      {Function   postCall  The post call function. Takes the response and returns the new response
     * @param      {Function   postConnect  The post connect function. Takes a RPC-websockets object and returns it
     */
    const overrideWebClient = (url, preCall, postCall, postConnect) => {
        const holochainClient = window.holochainClient;

        window.holochainClient = {
            connect: () => holochainClient.connect(url).then(({call, close, ws}) => {
                ws = postConnect(ws);
                return {
                    call: (callString) => (params) => {
                        const {callString: newCallString, params: newParams} = preCall(callString, params);
                        return call(newCallString)(newParams).then(postCall);
                    },
                    close,
                    ws,
                }
            })
        };
    }

    /**
     * Preprocesses the callString and params before making a call
     *
     * @param      {string}  callString  The call string e.g. dna/zome/function
     * @param      {Object}  params      The parameters 
     * @return     {callString, params}  The updated callString and params passed to call
     */
    const preCall = (callString, params) => {
        // TODO: sign the call and add the signature to the params object
        return {callString, params};
    }

    /**
     * Postprocess the response of a call before returning it to the UI
     *
     * @param      {string}  response  The response of the call
     * @return     {string}  Updated response
     */
    const postCall = (response) => {
        // TODO: Check response for authentication error to see if login is required
        // TODO: Sign the response and sent it back to the interceptor
        // TODO: Unpack the response to expose to the UI code (make it look like a regular holochain call)
        return response;
    }

    /**
     * Add any new callbacks to the websocket object or make calls immediatly after connecting
     *
     * @param      {<type>}  ws      { rpc=websockets object }
     */
    const postConnect = (ws) => {
        // TODO: subscribe to a rpc-websocket callback for sigining actions
        // e.g.
        // ws.subscribe("sign_entry");
        // ws.on("sign_entry", () => {
        //     // Sign the response and then send it back to the interceptor
        // });
        return ws;
    }

    return {
        overrideWebClient,
        generateNewReadwriteKeypair,
    };

})();
