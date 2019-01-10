addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

// Define URL to DNA KV store
const url2dna = {
    "test1.imagexchange.pl": "QmArtflouHash",
    "test2.imagexchange.pl": "QmSimpleHappHash",
    "test3.imagexchange.pl": "QmHappWithNoIPs",
};

// Define DNA to IP KV store
const dna2ip = {
    "QmArtflouHash": ["35.173.196.129"],
    "QmSimpleHappHash": ["3.85.69.42:4141"]
};


/**
 * Simple look up in fake KV store
 * TODO: Make the KV lookup real
 * TODO: Log request and response somewhere???
 * @param {Request} request
 */
async function handleRequest(request) {
    console.log(request);
    let responseObj = {};
    let responseStatus = 500;

    // Wrap code in try/catch block to return error stack in the response body
    try {
        // test namespace
        console.log('ns')
        ns = NAMESPACE.get()
        console.log(ns)

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
                //url: data.get('url')
                url: URLNoProtocolTrim
            }
            console.log(requestObj);

            if (!requestObj.dna && !requestObj.url) {
                responseStatus = 400;
            } else {
                // If dna was not passed then find it in the KV store
                if (!requestObj.dna) {
                    console.log('dna not sent; getting dna')
                    // Search in KV store for url.
                    responseObj.dna = url2dna[requestObj.url];
                }
                responseObj.hosts = dna2ip[responseObj.dna];
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

        return new Response(JSON.stringify(responseObj), init);
    } catch (e) {
        // Display the error stack.
        return new Response(e.stack || e)
    }
}