/**
 * hQuery.js
 * Is a helper module that manages connection between browser and HoloPorts on Holo network
 * Public API exposes: initHapp(), getHappUrl(), getHappDna()
 * TODO: In the future if the process of connecting to the host takes time (like more than 500ms)
 *       display nice Holo logo and something like "Connecting to Holo network..."
 */

const hQuery = (function(){
    // Networking settings etc
    const settings = {
        resolverUrl: '//resolver.holohost.net', // Address of url resolver service worker
        errorUrl:  '//loader1.holohost.net/error.html' // Address of an error page handler
    };

    // Private data store of the module
    let _url = '', // Url of the current hApp (host name from the browser's location field)
        _dna = '', // Hash of DNA of the current hApp
        _tranche = []; // Tranche - array of host addresses that serve given hApp

    /**
     * Url getter
     * @return url of the current hApp
     */
    const getHappUrl = () => _url;

    /**
     * DNA hash getter
     * @return Hash of DNA of the current hApp
     */
    const getHappDna = () => _dna;

    /**
     * Init hApp by taking url and grabing content from resolved HoloPort address
     * TODO: In the future we will want to have some mechanism of detecting failed calls
     *       to hosts, making call to another host from the list and reporting slacker
     *       to the tranche service
     * @return null
     */
    const initHapp = () => {
        // Save url of hApp
        // TODO: Check if protocol is https?
        _url = window.location.hostname;

        // Extend scope of ip
        let addr;
        // tmp
        //_url = "test2.imagexchange.pl";
        queryForHosts(_url)
            .then(obj => processWorkerResponse(obj))
            .then(r => {
                // Add protocol to hostname
                addr = 'ws://' + r;
                return fetchHappContent(r);
            })
            .then(html => replaceHtml(html, addr))
            /*
            .catch(e => handleError({
                code: e.code
            }))
            */
           ;
    }

    /**
     * Query Cloudflare worker resolver for array of hosts serving hApp, that is
     * registered with given URL. Can be identified by url or dna, dna takes precedence.
     * @param {string} url Url of the requested hApp
     * @param {string} dna Hash of a dna of requested hApp
     * @return {Object} {dna: '', ips: []} Hash of DNA and array of IPs
     */
    const queryForHosts = (url = "", dna = "") => {
        console.log('getting hosts for', url);
        // Call worker to resolve url to array of addresses of HoloPorts
        return fetch(settings.resolverUrl, {
                method: "POST",
                cache: "no-cache",
                //mode: "no-cors", can't use this mode, because I won't be able to access response body
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded", // Do not change or CORS will come and eat you alive
                },
                body: 'url=' + encodeURIComponent(url) + '&dna=' + encodeURIComponent(dna)
            })
            .then(r => {
                console.log("response", r)
                return r.json();
              }
            );
    }

    /**
     * Process response from the workers - for now trivialy just select first IP from array
     * @param {Object} obj Response from resolver Cloudflare worker
     * @param {array} obj.hosts Array of ips (or FQDNs) of HoloPorts serving given hApp
     * @param {string} obj.dna Hash of a DNA of requested hApp
     * @return {string} Return address of a host to initiate connection
     */
    const processWorkerResponse = obj => {
        console.log("processing worker response");

        // Save somewhere hApp DNA hash
        if (typeof obj.dna !== 'string' || obj.dna === "") {
            throw {
                code: 404
            };
        } else {
            console.log(obj.dna);
            _dna = obj.dna;
            console.log(_dna);
        }

        // Extract an IP that we want to grab
        if (typeof obj.hosts !== 'object' || obj.hosts.length === 0 || obj.hosts[0] === "") {
            throw {
                code: 503
            };
            return;
        } else {
            // Trivial now
            console.log(obj.hosts);
            _tranche = obj.hosts;
            console.log(_tranche);
            return _tranche[0];
        }
    }

    /**
     * Fetch hApp content from the given HoloPort (now identified by IP)
     * TODO: Pass more arguments (DNA, user pk), because one HoloPort can serve
     *       multiple hApps for multiple users...
     * TODO: Shall I also parse from url a path after domain name? That way we could maybe
     *       support a server side rendering of a hApp if container understands it...
     * @param {string} addr IP (or FQDNs) of HoloPort serving given hApp
     * @return {Promise} Html of the hApp
     */
    const fetchHappContent = (addr) => {
        // Fetch hApp content from selected HoloPort
        return fetch('//' + addr)
            .then(r => r.text())
    }

    /**
     * Redirect to error page and pass error info if available
     * TODO: Make this error handling much more sophisticated in the future,
     *       i.e. do not give up on first failure but try other hosts from the _tranche
     * @param {Object} e Error returned
     * @param {int} e.code Error code (standard http request error code)
     * @param {string} e.text Error description
     * @return null
     */
    const handleError = (e) => {
        if (typeof e !== 'undefined' && e.code) {
            console.log('Received error from Cloudflare worker: ' + e.code);
        } else {
            console.log('Received unknown error');
            e = {
                code: 500,
            }
        }

        /*
        window.location.href = settings.errorUrl
                             + '?errorCode=' + e.code
                             + ((_url) ? ('&url=' + encodeURI(_url)) : "")
                             + ((_dna) ? ('&dna=' + encodeURI(_dna)) : "");
                             */
    }

    /**
     * Replace entire html of the page
     * @param {string} html New html to replace the old one
     * @param {string} addr FQDN or IP of base of all the relative addresses (with protocol and port, e.g. //test.holo.host:4141")
     * @return null
     */
    const replaceHtml = (html, addr) => {
        html = insertScripts(html, addr);
        document.open();
        document.write(html);
        document.close();
    }

    // Public API
    return {
        initHapp: initHapp,
        getHappUrl: getHappUrl,
        getHappDna: getHappDna
    }
})();


/**
 * Adds a tiny script in the new document that sets window.holochainUrl which is later detected
 * by the hc-web-client to redirect calls. At the moment this adds the websocket 
 *
 * @param {string} html Html to add tag to
 * @param {string} url hostname (with protocol and port, e.g. //test.holo.host:4141")
 * @return {string} Html with new script tag inserted at the top level
 */
const insertScripts = (html, url) => {
    parser = new DOMParser();
    doc = parser.parseFromString(html, "text/html");

    let script = doc.createElement("script");
    script.src = "hClient.js"
    script.innerHTML = `hClient.overrideWebClient(${url})`;

    doc.head.appendChild(script);
    return doc.documentElement.outerHTML
}

console.log("hQuery loaded");