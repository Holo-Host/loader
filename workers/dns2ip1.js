addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})
  
// Define URL to DNA KV store
const url2dna = {
    "test1.imagexchange.pl": "QmArtflouHash",
    "test2.imagexchange.pl": "QmSimpleHappHash"
};

// Define DNA to IP KV store
const dna2ip = {
    "QmArtflouHash": ["35.173.196.129"],
    "QmSimpleHappHash": ["3.85.69.42:4141"]
};


/**
 * Fetch and log a request
 * @param {Request} request
 */
async function handleRequest(request) {
    const l = new URL(request.url)

    // Use l.host, not l.hostname, because we also need a port number
    const url = l.host;

    // Get IPs from thanche KV store and pass it in responseObject via <script> tag
    const scriptContent = 'var responseObject=' + JSON.stringify(resolveUrl(url));
    console.log(scriptContent);

    // Request index.html with hololoader.js
    const response = await fetch(request);

    // Now write scriptText into response body HTML
    let responseBody = await response.text();
    responseBody = addScriptToHtml(responseBody, scriptContent);
    console.log(responseBody);

    return new Response(responseBody, {
        headers: response.headers
    });
}

const resolveUrl = url => {
    let dna = url2dna[url]
    if (typeof dna === 'undefined') return {
        success: 0,
        error: {
            code: 404,
            text: 'There\'s no hApp registered at this address. Possible reason - hApp was registered less than 24h ago and data has not migrated yet.'
        }
    }

    let ip = dna2ip[dna]
    if (typeof ip === 'undefined') return {
        success: 0,
        error: {
            code: 503,
            text: 'None of the Holo Hosts is serving this hApp at the moment. (DNA hash ' + dna + ').'
        }
    }

    return {
        success: 1,
        ip: ip
    }

}

const addScriptToHtml = (html, scriptContent) => {
    // TODO: make this more robust with a real HTML parser.
    // For instance, this fails on something weird like:
    // <head data-lol=">">
    return html.replace(/<\/html>/, `<script>${scriptContent}</script><head>`)
}