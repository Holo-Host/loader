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


    /**
     * Wraps and overwrites the current holochainClient attached to the window
     * Keeps the same functionaltiy but adds preCall and postCall hooks and also forces
     * connect to go to a given URL
     *
     * @param      {<type>}    url       The url to connect to
     * @param      {Function}  preCall   The pre call funciton
     * @param      {Function   postCall  The post call function
     */
    const overrideWebClient = (url, preCall, postCall) => {
        const holochainClient = window.holochainClient;

        window.holochainClient = {
            connect: () => holochainClient.connect(url).then(({call, close, ws}) => {
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

    // /**
    //  * Preprocesses the callString and params before making a call
    //  *
    //  * @param      {string}  callString  The call string e.g. dna/zome/function
    //  * @param      {Object}  params      The parameters 
    //  * @return     {callString, params}  The updated callString and params passed to call
    //  */
    // const preCall = (callString, params) => {
    //     return {callString, params};
    // }

    // /**
    //  * Postprocess the response of a call before returning it to the UI
    //  *
    //  * @param      {string}  response  The response of the call
    //  * @return     {string}  Updated response
    //  */
    // const postCall = (response) => {
    //     return response;
    // }

    return {
        overrideWebClient
    };

})();
