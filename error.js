window.onload = function() {
    var qs = (function(a) {
        if (a == "") return {};
        var b = {};
        for (var i = 0; i < a.length; ++i)
        {
            var p=a[i].split('=');
            if (p.length != 2) continue;
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
        }
        return b;
    })(window.location.search.substr(1).split('&'));

    console.log(qs);

    if (qs.errorCode) document.getElementById("errorLongDescCode").innerHTML = qs.errorCode;
    if (qs.errorText) document.getElementById("errorLongDescText").innerHTML = qs.errorText;
}