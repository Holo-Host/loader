/**
 * hLoader is a self-initiating script that downloads hApp's UI from HoloPorts on Holo network
 *
 * Public API exposes: initHapp()
 * TODO: In the future if the process of connecting to the host takes time (like more than 500ms)
 *       display nice Holo logo and something like "Connecting to Holo network..."
 *
 */

window.hLoader = (function(){
    // Networking settings etc
    const settings = {
        resolverUrl: '//resolver.holohost.net', // Address of url resolver service worker
        errorUrl:  '//loader.holohost.net/error.html' // Address of an error page handler
    };

    // Private data store of the module
    let _url = '', // Url of the current hApp (host name from the browser's location field)
        _bundleHash = '', // Hash of bundle of the current hApp
        _UI_tranche = [], // Tranche - array of host addresses that serve given hApp's UI
        _UI_host = ''; // Currently queried host

    /**
     * Init hApp by taking url and grabing content from resolved HoloPort address
     * TODO: Loader should look for a _UI_tranche in localStorage(). If not found it should download _UI_tranche
     *       from resolver.holohost.net and save it in the localStorge() for later use.
     *       We will also want to have some mechanism of detecting failed calls to hosts,
     *       making call to another host from the list and reporting slacker
     *       to the tranche service
     * @return null
     */
    const initHapp = () => {
        // Grab url of hApp
        _url = window.location.hostname;

        queryForHosts(_url)
            .then(obj => processWorkerResponse(obj))
            .then(() => replaceHtml())
            .catch(e => handleError({
                code: e.code
            }))
           ;
    }

    /**
     * Query Cloudflare worker resolver for array of hosts serving anonymous version of hApp that is
     * registered with given URL. Can be identified by url or bundle hash, hash takes precedence.
     * @param {string} url Url of the requested hApp
     * @param {string} bundleHash Hash of a bundle of requested hApp
     * @return {Object} {bundleHash: '', ips: []} Hash of bundle and array of IPs
     */
    const queryForHosts = (url = "", bundleHash = "") => {
        console.log('Getting hosts for ', url);
        // Call worker to resolve url to array of addresses of HoloPort
        return fetch(settings.resolverUrl, {
                method: "POST",
                cache: "no-cache",
                //mode: "no-cors", can't use this mode, because I won't be able to access response body
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded", // Do not change or CORS will come and eat you alive
                },
                body: 'url=' + encodeURIComponent(url) + '&hash=' + encodeURIComponent(bundleHash)
            })
            .then(r => {
                return r.json();
              }
            );
    }

    /**
     * Process response from the workers - for now trivialy just select first IP from array
     * @param {Object} obj Response from resolver Cloudflare worker
     * @param {array} obj.hosts Array of ips (or FQDNs) of HoloPorts serving given hApp
     * @param {string} obj.hash Hash of a bundle of requested hApp
     * @return {string} Return address of a host to initiate connection
     */
    const processWorkerResponse = obj => {
        console.log("Processing worker response");

        // Save somewhere hApp bundle's hash
        if (typeof obj.hash !== 'string' || obj.hash === "") {
            throw {
                code: 404
            };
        } else {
            _bundleHash = obj.hash.trim();
        }

        // Extract an IP that we want to grab
        if (typeof obj.hosts !== 'object' || obj.hosts.length === 0 || obj.hosts[0] === "") {
            throw {
                code: 503
            };
            return;
        } else {
            // Trivial now
            _UI_tranche = obj.hosts;
            _UI_host = _UI_tranche[0];
        }
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
    const handleError = (e) => {
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
     * This function is actually removing all the content of the body and creating iFrame
     * where entire UI of a hApp is loaded from HoloPort.
     * This gives us consistent behaviour of the UI (no hacks)
     * while leaving url in browser intact
     * @return null
     */
    const replaceHtml = () => {
        let addr = formatAddress();

        // create iFrame
        let frame = document.createElement('iframe');
        frame.setAttribute('id', 'main');
        frame.setAttribute('src', addr);
        frame.setAttribute('style', 'position:fixed; top:0; left:0; bottom:0; right:0; width:100%; height:100%; border:none; margin:0; padding:0; overflow:hidden; z-index:999999;')

        // replace body with created iFrame
        document.getElementById('old_main').replaceWith(frame);

        // TODO: establish inter-frame communication with Window​.post​Message()
        // to listen to title updates (window.document.title),
        // url updates (https://stackoverflow.com/a/3354511/1182050),
        // etc.
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
    const formatAddress = () => {
        const urlObj = _UI_host.replace('http://','').replace('https://','').split(/[/?#]/);

        // Check if host or bundleHash are non empty
        if (urlObj.length === 0 || urlObj[0] === "" || _bundleHash === "")
            throw {
                code: 404
            };
        
        // Also check if url starts with hc as expected and then truncate it TODO remove
        let str = urlObj[0].toLowerCase().trim();   
        /* if (str.slice(0, 2) !== "hc")
            throw {
                code: 404
            };
        else
            str = str.slice(2);*/

        // return 'http://' + urlObj[0];
        return 'http://' + _bundleHash + '.' + str + '/';
    }

    // Public API
    return {
        initHapp,
    }

})();

hLoader.initHapp();
