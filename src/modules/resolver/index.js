const settings = {
  resolverUrl: "//resolver.holohost.net", // Address of url resolver service worker
  errorUrl: "//loader.holohost.net/error.html" // Address of an error page handler
};


export default class HoloResolver {
    _url = ''; // Url of the current hApp (host name from the browser's location field)
    _bundleHash = ''; // Hash of bundle of the current hApp
    _UI_host = ''; // Currently queried host

    constructor(location) {
        this._url = location.hostname;
    }

    /**
     * Query Cloudflare worker resolver for array of hosts serving anonymous version of hApp that is
     * registered with given URL. Can be identified by url or bundle hash, hash takes precedence.
     * @param {string} url Url of the requested hApp
     * @param {string} bundleHash Hash of a bundle of requested hApp
     * @return {Object} {hash: '', hosts: []} Hash of bundle and array of IPs
     */
    queryForHosts = (bundleHash = '') => {
        const url = this._url;
        const requestBody = `url=${encodeURIComponent(url)}&hash=${encodeURIComponent(bundleHash)}`;

        console.log('Getting hosts for ', url);
        // Call worker to resolve url to array of addresses of HoloPort
        return fetch(settings.resolverUrl, {
            method: 'POST',
            cache: 'no-cache',
            //mode: 'no-cors', can't use this mode, because I won't be able to access response body
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded', // Do not change or CORS will come and eat you alive
            },
            body: requestBody
        })
            .then(r => r.json());
    }

    /**
     * Process response from the workers - for now trivialy just select first IP from array
     * @param {Object} obj Response from resolver Cloudflare worker
     * @param {array} obj.hosts Array of ips (or FQDNs) of HoloPorts serving given hApp
     * @param {string} obj.hash Hash of a bundle of requested hApp
     * @return {string} Return address of a host to initiate connection
     */
    processWorkerResponse = obj => {
        console.log("Processing worker response");

        // Save somewhere hApp bundle's hash
        if (typeof obj.hash !== 'string' || obj.hash === "") {
            throw {
                code: 404
            };
        }
        this._bundleHash = obj.hash.trim();

        // Extract an IP that we want to grab
        if (typeof obj.hosts !== 'object' || obj.hosts.length === 0 || obj.hosts[0] === '') {
            throw {
                code: 503
            };
        }

        const _UI_tranche = obj.hosts;
        this._UI_host = _UI_tranche[0];
    }


    /**
     * Redirect to error page and pass error info if available
     * TODO: Make this error handling much more sophisticated in the future,
     *       i.e. do not give up on first failure but try other hosts from the _UI_tranche
     * @param {Object} e Error returned
     * @param {int} e.code Error code (standard http request error code)
     * @param {string} e.text Error description
     * @return null
     */
    handleError = (e) => {
        if (typeof e !== 'undefined' && e.code) {
            console.log('Received error from Cloudflare worker: ' + e.code);
        } else {
            console.log('Received unknown error');
            e = {
                code: 500,
            }
        }

        /*window.location.href = settings.errorUrl
                                + '?errorCode=' + e.code
                                + ((_url) ? ('&url=' + encodeURI(_url)) : "")
                                + ((_bundleHash) ? ('&hash=' + encodeURI(_bundleHash)) : "");*/
    }

    /**
     * Format HoloPort's FQDN so that everything works as gold:
     * // is for protocol
     * test.holo.host:4141/ is for url and port
     * 000bundleHash000/ is for bundelHash
     * that will give //test.holo.host:4141/000bundleHash000/
     * TODO: make sure we can ignore any possible path in the url (stuff after slash)
     *
     * No params because I love this ugly non-funcitonal way of passing values via global variables ugh.
     * @return {string} formated URI
     */
    formatAddress = () => {
        const urlObj = this._UI_host
            .replace('http://','')
            .replace('https://','')
            .split(/[/?#]/);

        // Check if host or bundleHash are non empty
        if (urlObj.length === 0 || urlObj[0] === "" || this._bundleHash === "") {
            throw {
                code: 404
            };
        }

        // Also check if url starts with hc as expected and then truncate it TODO remove
        const str = urlObj[0].toLowerCase().trim();
        /* if (str.slice(0, 2) !== "hc")
            throw {
                code: 404
            };
        else
            str = str.slice(2);*/

        // return 'http://' + urlObj[0];
        return 'http://' + this._bundleHash + '.' + str + '/';
    }
}
