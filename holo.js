/** 
 * Holo.js
 * Calls dna2ip, then makes a call to this IP and replaces dom in passed element
 * On error redirects to Error page
 */

const errorUrl = '//loader.imagexchange.pl/error.html';
const dna2ipUrl = '//dna2ip1.holohost.net';

const holoLoadDna = (dna) => {
    fetchPost(dna2ipUrl, 'dna=' + dna)
        .then(r => {
            console.log(r);
            // Check response code
            if (!r.ok) {
                throw Error(r.status);
            }
            
            return r.json();
        })
        .then(obj => {
            if (obj.ip === undefined) throw Error(500);
            console.log('Trying to get html from IP ' + obj.ip);
            return fetchGet(obj.ip)
        })
        .then(r => r.text())
        .then(html => {
            replaceHtml(html);
        })
        .catch(e => handleDnaError(e));
}

/** 
 * Replace entire html of the page
 * @param {string} html New html to replace the old one
 */
const replaceHtml = html => {
    document.open();
    document.write(html);
    document.close();
}

/** 
 * Replace html inside of the DOM element with given id
 * @param {string} html New html to replace the old one
 * @param {string} domElId Id of the DOM element to inject html into
 */
const replaceDomEl = (html, domElId) => {
    let domEl = document.getElementById(domElId);

    if (domEl !== undefined) domEl.innerHTML = html;
}

/**
    TODO: display type of error to user based on result from dna2ip
*/
const handleError = (e) => {
    console.log(e);
    //window.location.href = errorUrl;
}