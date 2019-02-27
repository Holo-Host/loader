require('babel-polyfill');
/**
 * hClient.js
 * An API compatible drop-in for hc-web-client. The module exports a functin that accepts an hc-web-client and returns a holo-fied version
 * 
 * It adds the additional functionality of
 *     - Connecting to the correct holo-port
 *     - Signing all calls with the agents private key
 *     - Intercepting unauthorized responses to display a login screen
 */

const hClient = (function() {

    const { insertLoginHtml, registerLoginCallbacks, showLoginDialog } = require("./login");
    const { 
        generateReadonlyKeypair,
        generateNewReadwriteKeypair,
        regenerateReadwriteKeypair
    } = require("./keyManagement");

    const defaultWebsocketUrl = "ws://"+location.hostname+":"+location.port;

    let keypair;
    
    /**
     * Wraps and returns a holochainClient module
     * Keeps the same functionaltiy but adds preCall and postCall hooks and also forces
     * connect to go to a given URL
     *
     * @param      {Object} holochainClient A hc-web-client module to wrap
     * @param      {string}    url       The url to connect to
     * @param      {Function}  preCall   The pre call funciton. Takes the callString and params and returns new callString and params
     * @param      {Function   postCall  The post call function. Takes the response and returns the new response
     * @param      {Function   postConnect  The post connect function. Takes a RPC-websockets object and returns it preCall=preCall, postCall=postCall, postConnect=postConnect
     */
    const makeWebClient = (holochainClient, url, preCall, postCall, postConnect) => {

        url = url || defaultWebsocketUrl;
        preCall = preCall || _preCall;
        postCall = postCall || _postCall;
        postConnect = postConnect || _postConnect;

        return {
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
        }
    }

    /**
     * Gets the current agent identifier from the current key pair
     *
     * @return     {(Encoding|Object)}  The current agent identifier.
     */
    const getCurrentAgentId = () => {
        if (keypair) {
            return keypair.getId();
        } else {
            return undefined;
        }
    }


    /**
     * Preprocesses the callString and params before making a call
     *
     * @param      {string}  callString  The call string e.g. dna/zome/function
     * @param      {Object}  params      The parameters 
     * @return     {callString, params}  The updated callString and params passed to call
     */
    const _preCall = (callString, params) => {
        // TODO: sign the call and add the signature to the params object
        if (!keypair) {
            throw new Error("trying to call with no keys");
        } else {
            console.log("call will be signed with", keypair);
            return {callString, params};
        }
    }

    /**
     * Postprocess the response of a call before returning it to the UI
     *
     * @param      {string}  response  The response of the call
     * @return     {string}  Updated response
     */
    const _postCall = (response) => {
        // TODO: Check response for authentication error to see if login is required
        // TODO: Sign the response and sent it back to the interceptor
        // TODO: Unpack the response to expose to the UI code (make it look like a regular holochain call)
        
        response = JSON.parse(response);
        
        if (response.Err  && response.Err.code == 401) {
            showLoginDialog((email, password) => {
                generateNewReadwriteKeypair(email, password).then(kp => {
                    console.log('Registered keypair is ', kp);
                    keypair = kp;
                });
            });
        }

        return response;
    }

    /**
     * Add any new callbacks to the websocket object or make calls immediatly after connecting
     *
     * @param      {<type>}  ws      { rpc=websockets object }
     */
    const _postConnect = (ws) => {
        // TODO: subscribe to a rpc-websocket callback for sigining actions
        // e.g.
        // ws.subscribe("sign_entry");
        // ws.on("sign_entry", () => {
        //     // Sign the response and then send it back to the interceptor
        // });
        console.log('generating readonly keypair');
        generateReadonlyKeypair().then(kp => {
            console.log('temp keypair is ', kp);
            keypair = kp;
        });

        return ws;
    }



    return {
        makeWebClient,
        generateNewReadwriteKeypair,
        insertLoginHtml,
        registerLoginCallbacks,
        showLoginDialog,
        getCurrentAgentId,
    };

})();

module.exports = hClient;
