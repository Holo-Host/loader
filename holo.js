/** 
 * Holo.js
 * Calls dna2ip, then makes a call to this IP and replaces dom in passed element
 * On error redirects to Error page
 */

const errorUrl = 'https://error.holohost.net';
const dna2ipUrl = 'https://dna2ip.holohost.net';

const holoLoadDna = (dna) => {
    myFetch(dna2ipUrl, dna)
        .then(ip => {
            return myFetch(ip)
        })
        .then(html => replaceHtml(html))
        .catch(e => handleError(e))
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