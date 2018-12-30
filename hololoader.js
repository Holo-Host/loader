/** 
    HoloLoader.js
    Calls url2dna service and passes dna to Holo.js
*/

// url2dna - service worker resolving url to DNA hash of the hApp
const url2dnaUrl = '//dns2dna1.holohost.net';
const dnaErrorUrl = '//loader.imagexchange.pl/error.html';

// Get location from url
// TODO: clean up url to the format accepted by worker
// TODO: extract any locaiton or query string parameters?
const data = 'url=' + window.location.hostname;
console.log(data);

window.onload = function() {
    fetchPost(url2dnaUrl, data)
        .then(r => {
            console.log(r);
            // Check response code
            if (!r.ok) {
                throw Error(r.status);
            }
            
            return r.json();
        })
        .then(obj => {
            if (obj.dna === undefined) throw Error(500);
            holoLoadDna(obj.dna);
        })
        .catch(e => handleDnaError(e));
}

/**
 *  TODO: display type of error to user based on result from dna2ip
 */
const handleDnaError = (errorCode) => {
    console.log(errorCode);
    window.location.href = dnaErrorUrl + '?errorCode=' + errorCode;
}

// fetch wrapper for POST request with Content-Type: "application/x-www-form-urlencoded"
// We have to send this type of content because of CORS bs: "https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#Simple_requests"
const fetchPost = (url = '', data = {}) => {
    return fetch(url, {
        method: "POST",
        cache: "no-cache",
        //mode: "no-cors", can't use this mode, because response I won't be able to access response body via js
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: data
    });
}

// fetch wrapper for GET
const fetchGet = (url = '') => {
    return fetch(url, {
        method: "GET",
        cache: "no-cache"
    });
}