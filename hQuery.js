/** 
 * hQuery.js
 * Is a helper library that manages connection between browser and HoloPorts on Holo network
 */


/**
 * Init hApp by taking url and grabing content from resolved HoloPort address
 * @param {string} url Url of the requested hApp
 */
const initHapp = url => {
    const ip = processWorkerResponse(queryForHosts(url));

    const html = fetchHappContent(ip);

    replaceHtml(html, ip);
}


/**
 * Query Cloudflare worker url2ip for array of hosts serving hApp, that is 
 * registered with given URL. Can be identified by url or hash
 * @param {string} url Url of the requested hApp
 * @param {string} dna Hash of a dna of requested hApp
 * @return {Object} {dna: '', ips: []} Hash of DNA and array of IPs
 */
const queryForHosts = (url = "", dna = "") => {
    // Address of url2ip service worker
    const url2ipUrl = '//url2ip.holohost.net';

    // Call worker to resolve url to array of IPs of HoloPorts
    return fetch(url2ipUrl, {
            method: "POST",
            cache: "no-cache",
            //mode: "no-cors", can't use this mode, because I won't be able to access response body
            headers: {
                "Content-Type": "application/json",
            },
            body: {url,data}
        })
        .then(r => r.json())
        .then(obj => {
            console.log('hApp DNA: ' + obj.dna);
            console.log('hApp IPs: ' + obj.ips);
            return obj;
        })
        .catch(e => handleError({
            code: 500,
            text: e
        }));
}

/**
 * Process response from the workers - for now trivialy just select first IP from array
 * TODO: Make it much more sophisticated, including saving entire tranche for future calls
 * TODO: Move all the response statuses to worker and here only translate them into text
 * @param {Object} obj Response from url2ip worker
 * @param {array} obj.ips Array of ips (or FQDNs) of HoloPorts serving given hApp
 * @param {string} obj.dna Hash of a DNA of requested hApp
 */
const processWorkerResponse = obj => {
    // Save somewhere hApp DNA hash
    // TODO: save it in some private variable and write a getter
    const dna = obj.dna;
    if (typeof dna !== 'string' || dna === "") {
        handleError({
            code: 404,
            text: 'There\'s no hApp registered at this address. Possible reason - hApp was registered less than 24h ago and data has not migrated yet.'
        });
        return;
    }

    // Extract an IP that we want to grab
    // TODO: save it in some private variable and write a getter
    if (typeof ips !== 'array' || ips.length === 0 || ip[0] === "") {
        handleError({
            code: 503,
            text: 'None of the Holo Hosts is serving this hApp at the moment. (DNA hash ' + dna + ').'
        });
        return;
    } else {
        // Trivial now
        return ips[0];
    }
}

/**
 * Fetch hApp content from the given HoloPort (now identified by IP)
 * TODO: Pass more arguments (DNA, user pk), because one HoloPort can serve
 *       multiple hApps for multiple users...
 * TODO: Shall I also parse from url a path after domain name? That way we could maybe 
 *       support a server side rendering of a hApp if container understands it...
 * @param {string} ip IP (or FQDNs) of HoloPort serving given hApp
 */
const fetchHappContent = (ip) => {
    // Fetch hApp content from selected HoloPort
    return fetch('http://' + ip)
        .then(r => r.text())
        .catch(e => handleError({
            code: 500,
            text: e
        }));
}

/**
 * Redirect to error page and pass error info if available
 * @param {Object} e Error returned
 * @param {int} e.code Error code (standard http request error code)
 * @param {string} e.text Error description
 */
const handleError = (e) => {
    const errorUrl = '//loader1.holohost.net/error.html';

    if (typeof e !== 'undefined' && e.code && e.text) {
        console.log('Received error from Cloudflare worker: ' + e.code + ': ' + e.text);
    } else {
        console.log('Received unknown error from Cloudflare');
        e = {
            code: 500,
            text: 'General network error'
        }
    }

    window.location.href = errorUrl + '?errorCode=' + e.code + '&errorText=' + encodeURI(e.text);
}

/** 
 * Replace entire html of the page
 * @param {string} html New html to replace the old one
 */
const replaceHtml = (html, ip) => {
    html = addBaseRaw(html, ip);
    document.open();
    document.write(html);
    document.close();
}

/** 
 * Add <base> tag that defines host for relative urls on page
 * @param {string} html Html to add tag to
 * @param {string} url hostname (with protocol and port, e.g. //test.holo.host:4141")
 */
const addBaseRaw = (html, url) => {
    // TODO: make this more robust with a real HTML parser.
    // For instance, this fails on something weird like:
    // <head data-lol=">">
    return html.replace(/<head(.*?)>/, `<head$1><base href="${url}"/>`)
}