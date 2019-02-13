addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

/**
 * TODO: error checks and responses
 * TODO: Log request and response somewhere???
 * @param {Request} request
 */
async function handleRequest(request) {
    let requestHeaders = JSON.stringify([...request.headers], null, 2)
    console.log(`Request headers: ${requestHeaders}`)
    console.log(request);
    let responseObj = {};
    let responseStatus = 500;

    // Wrap code in try/catch block to return error stack in the response body
    try {
        // Check request parameters first
        if (request.method.toLowerCase() !== 'post') {
            responseStatus = 400;
        } else if (request.headers.get("Content-Type") !== 'application/x-www-form-urlencoded') {
            responseStatus = 415;
        } else {
            const data = await request.formData();
            //console.log(data)
            // get url and prepare
            //console.log('request.url', request.url)
            // trim protocol
            const URLNoProtocol = request.url.replace(/(^\w+:|^)\/\//, '');
            // trim trailing slash
            URLNoProtocolTrim = URLNoProtocol.replace(/\/$/, "");
            //console.log('URLNoProtocolTrim', URLNoProtocolTrim)
            const requestObj = {
                dna: data.get('dna'),
                url: URLNoProtocolTrim
            }
            console.log(requestObj);

            if (!requestObj.dna && !requestObj.url) {
                responseStatus = 400;
            } else {
                // If dna was not passed then find it in the KV store
                if (!requestObj.dna) {
                    console.log('dna not sent; getting dna for', requestObj.url)
                    // get from KV store
                    responseObj.dna = await DNS2DNA.get(requestObj.url)
                    /*
                    if (value === null)
                      return new Response("Value not found", {status: 404})
                    return new Response(value)
                    */
                }
                console.log('getting IPs for', responseObj.dna)
                // get value from KV store
                let hostsArrayJSON = await DNA2IP.get(responseObj.dna, "json")
                // console.log("h2", hostsArrayJSON)
                // set
                responseObj.hosts = hostsArrayJSON
                // console.log(responseObj.hosts)
                responseStatus = 200;
            }
        }

        const init = {
            status: responseStatus,
            headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
            }
        }
        console.log(responseObj)
        return new Response(JSON.stringify(responseObj), init);
    } catch (e) {
        // Display the error stack.
        return new Response(e.stack || e)
    }
}