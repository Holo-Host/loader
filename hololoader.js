/** 
 * HoloLoader.js
 * Takes responseObject injected into html by Cloudflare service worker and replaces page content
 * with the code received from holo Port
 */

window.onload = function() {
    // Check if responseObject made it from Cloudflare worker into html
    if (typeof responseObject === undefined || typeof responseObject !== 'object' || responseObject === null) {
        console.log('Missing responseObject');
        return;
    }

    console.log(responseObject);

    // If worker passed IP succesfuly then proceed
    if (responseObject.success && responseObject.ip && responseObject.ip[0]) {
        fetch(responseObject.ip[0], {
            method: "GET",
            cache: "no-cache"
        })
        .then(r => r.text())
        .then(html => {
            html = addBaseRaw(html, ip);
            replaceHtml(html);
        })
        .catch(e => handleError({
            code: 500,
            text: e
        }));

        return true;
    }

    // If still here then handle error
    handleError(responseObject.error);
}

/**
 *  Redirect to error page and pass error info if available
 */
const handleError = (e) => {
    const errorUrl = '//loader1.holohost.net/error.html';

    if (typeof e !== undefined && e.code && e.text) {
        console.log('Received error from Cloudflare worker: ' + e.code + ': ' + e.text);
        //window.location.href = errorUrl + '?errorCode=' + e.code + '&errorText=' + encodeURI(e.text);
    } else {
        console.log('Received unknown error from Cloudflare');
        //window.location.href = errorUrl;
    }
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
 * Replace entire html of the page
 * @param {string} html New html to replace the old one
 */
const addBaseRaw = (html, url) => {
    // TODO: make this more robust with a real HTML parser.
    // For instance, this fails on something weird like:
    // <head data-lol=">">
    return html.replace(/<head(.*?)>/, `<head$1><base href="${url}"/>`)
}