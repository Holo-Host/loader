// Error code to error description table in a format:
// { 
//     errorCode: { 
//        errorDescriptionShort: "errorDescriptionShort",
//        possibleReasons: ["reason1", "reason2"]
//     }
// }
// Compare https://tools.ietf.org/html/rfc7231#section-6
const errorTableEn = {
    400: {
        errorDescriptionShort: 'Bad request',
        possibleReasons: [
            'Request made to the server was imporperly formatted. Please check documentation for proper formatting'
        ]
    },
    404: {
        errorDescriptionShort: 'Not found',
        possibleReasons: [
            'There\'s no hApp registered at this address',
            'hApp was registered less than 24h ago and data has not migrated yet.'
        ]
    },
    415: {
        errorDescriptionShort: 'TODO:', // TODO:
        possibleReasons: [
            'Request made to the server was imporperly formatted. Please check documentation for proper formatting'
        ]
    },
    500: {
        errorDescriptionShort: 'Internal network error', // TODO:
        possibleReasons: [
            'Unknown reason 1',
            'Unknown reason 2'
        ]
    },
    503: {
        errorDescriptionShort: 'TODO:', // TODO:
        possibleReasons: [
            'None of the Holo Hosts is serving this hApp at the moment.'
        ]
    }
};

/**
 * Init error page
 * @return null
 */
const initError = () => {
    const qs = parseQuery(window.location.search.substr(1).split('&'));

    if (typeof qs.errorCode === 'undefined') qs.errorCode = 500;

    document.getElementById("errorCode").innerHTML = qs.errorCode;
    if (errorDescriptionShort) document.getElementById("errorDescriptionShort").innerHTML = errorTableEn[qs.errorCode].errorDescriptionShort;
    if (possibleReasonsHtml) document.getElementById("errorLongReasons").innerHTML = possibleReasonsHtml(errorTableEn[qs.errorCode].possibleReasons);
}

/**
 * Parse query string from the url
 * @param {string} a query string
 * @return {Object}
 */
const parseQuery = a => {
    if (a == "") return {};
    var b = {};
    for (var i = 0; i < a.length; ++i)
    {
        var p=a[i].split('=');
        if (p.length != 2) continue;
        b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
    }
    return b;
}

/**
 * Prints array of reasons into html list
 * @param {array} arr
 * @return {Strinh} html
 */
const possibleReasonsHtml = arr => {
    let html = "<ul>";
    for (i = 0; i < arr.length; i++) {
        html += '<li>' + arr[i] + '</li>';
    }
    return html + '</ul>';
}

// TODO: Give more informative advises on what to do with an error