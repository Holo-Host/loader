/** 
    HoloLoader.js
    Calls url2dna service and passes dna to Holo.js
*/

// url2dna - service worker resolving url to DNA hash of the hApp
const url2dnaUrl = 'https://url2dna.holohost.net';
const dnaErrorUrl = 'https://error.holohost.net';

// Get location from url
// TODO: clean up url to the format accepted by worker
// TODO: extract any locaiton or query string parameters?
const windowUrl = window.location.hostname;
console.log(windowUrl);

window.onload = function() {
    myFetch(url2dnaUrl, windowUrl)
        .then(dna => holoLoadDna(dna))
        .catch(e => handleDnaError(e));
}

/**
 *  TODO: display type of error to user based on result from dna2ip
 */
const handleDnaError = (e) => {
    console.log(e);
    // window.location.href = dnaErrorUrl;
}

// fetch does not return an error if response is not ok (eg. response code 500)
// therefore it needs extra check while resolving promise. Or just switch to axios :-)
const myFetch = (url = '', data = {}) => {
    return fetch(url, {
        method: "POST",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    });
}