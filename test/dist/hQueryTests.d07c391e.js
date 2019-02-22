// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  return newRequire;
})({"../web/hQuery.js":[function(require,module,exports) {
/**
 * hQuery.js
 * Is a helper module that manages connection between browser and HoloPorts on Holo network
 * Public API exposes: initHapp(), getHappUrl(), getHappDna()
 * TODO: In the future if the process of connecting to the host takes time (like more than 500ms)
 *       display nice Holo logo and something like "Connecting to Holo network..."
 */
const hQuery = function () {
  // Networking settings etc
  const settings = {
    resolverUrl: '//resolver.holohost.net',
    // Address of url resolver service worker
    errorUrl: '//loader1.holohost.net/error.html' // Address of an error page handler

  }; // Private data store of the module

  let _url = '',
      // Url of the current hApp (host name from the browser's location field)
  _dna = '',
      // Hash of DNA of the current hApp
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
    _url = window.location.hostname; // Extend scope of ip

    let addr; // tmp
    //_url = "test2.imagexchange.pl";

    queryForHosts(_url).then(obj => processWorkerResponse(obj)).then(r => {
      // Add protocol to hostname
      addr = 'ws://' + r;
      return fetchHappContent(r);
    }).then(html => replaceHtml(html, addr))
    /*
    .catch(e => handleError({
        code: e.code
    }))
    */
    ;
  };
  /**
   * Query Cloudflare worker resolver for array of hosts serving hApp, that is
   * registered with given URL. Can be identified by url or dna, dna takes precedence.
   * @param {string} url Url of the requested hApp
   * @param {string} dna Hash of a dna of requested hApp
   * @return {Object} {dna: '', ips: []} Hash of DNA and array of IPs
   */


  const queryForHosts = (url = "", dna = "") => {
    console.log('getting hosts for', url); // Call worker to resolve url to array of addresses of HoloPorts

    return fetch(settings.resolverUrl, {
      method: "POST",
      cache: "no-cache",
      //mode: "no-cors", can't use this mode, because I won't be able to access response body
      headers: {
        "Content-Type": "application/x-www-form-urlencoded" // Do not change or CORS will come and eat you alive

      },
      body: 'url=' + encodeURIComponent(url) + '&dna=' + encodeURIComponent(dna)
    }).then(r => {
      console.log("response", r);
      return r.json();
    });
  };
  /**
   * Process response from the workers - for now trivialy just select first IP from array
   * @param {Object} obj Response from resolver Cloudflare worker
   * @param {array} obj.hosts Array of ips (or FQDNs) of HoloPorts serving given hApp
   * @param {string} obj.dna Hash of a DNA of requested hApp
   * @return {string} Return address of a host to initiate connection
   */


  const processWorkerResponse = obj => {
    console.log("processing worker response"); // Save somewhere hApp DNA hash

    if (typeof obj.dna !== 'string' || obj.dna === "") {
      throw {
        code: 404
      };
    } else {
      console.log(obj.dna);
      _dna = obj.dna;
      console.log(_dna);
    } // Extract an IP that we want to grab


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
  };
  /**
   * Fetch hApp content from the given HoloPort (now identified by IP)
   * TODO: Pass more arguments (DNA, user pk), because one HoloPort can serve
   *       multiple hApps for multiple users...
   * TODO: Shall I also parse from url a path after domain name? That way we could maybe
   *       support a server side rendering of a hApp if container understands it...
   * @param {string} addr IP (or FQDNs) of HoloPort serving given hApp
   * @return {Promise} Html of the hApp
   */


  const fetchHappContent = addr => {
    // Fetch hApp content from selected HoloPort
    return fetch('//' + addr).then(r => r.text());
  };
  /**
   * Redirect to error page and pass error info if available
   * TODO: Make this error handling much more sophisticated in the future,
   *       i.e. do not give up on first failure but try other hosts from the _tranche
   * @param {Object} e Error returned
   * @param {int} e.code Error code (standard http request error code)
   * @param {string} e.text Error description
   * @return null
   */


  const handleError = e => {
    if (typeof e !== 'undefined' && e.code) {
      console.log('Received error from Cloudflare worker: ' + e.code);
    } else {
      console.log('Received unknown error');
      e = {
        code: 500
      };
    }
    /*
    window.location.href = settings.errorUrl
                         + '?errorCode=' + e.code
                         + ((_url) ? ('&url=' + encodeURI(_url)) : "")
                         + ((_dna) ? ('&dna=' + encodeURI(_dna)) : "");
                         */

  };
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
  };
  /**
   * Adds a script that imports hClient and overrides the window web client.
   * Effectively enables a holochain app to be holo compatible
   *
   * @param {string} html Html to add tag to
   * @param {string} url hostname (with protocol and port, e.g. //test.holo.host:4141")
   * @return {string} Html with new script tag inserted at the top level
   */


  const insertScripts = (html, url) => {
    parser = new DOMParser();
    doc = parser.parseFromString(html, "text/html");
    let script = doc.createElement("script");
    script.src = "hClient.js";
    script.innerHTML = `hClient.overrideWebClient(${url})`;
    doc.head.appendChild(script);
    return doc.documentElement.outerHTML;
  }; // Public API


  return {
    initHapp,
    getHappUrl,
    getHappDna,
    insertScripts
  };
}();

module.exports = hQuery;
},{}],"hQueryTests.js":[function(require,module,exports) {
const hQuery = require("../web/hQuery.js");

describe("hQuery: insertScripts", () => {
  it("should add the correct override script to a simple HTML string", () => {
    htmlString = "<html><body>original content</body></html>";
    newString = hQuery.insertScripts(htmlString, "ws://");
    expect(newString).toBe(`<html><head><script src="hClient.js">hClient.overrideWebClient(ws://)</script></head><body>original content</body></html>`);
  });
});
},{"../web/hQuery.js":"../web/hQuery.js"}],"../../../.nvm/versions/node/v8.4.0/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "40227" + '/');

  ws.onmessage = function (event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      console.clear();
      data.assets.forEach(function (asset) {
        hmrApply(global.parcelRequire, asset);
      });
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.parcelRequire, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAccept(global.parcelRequire, id);
  });
}
},{}]},{},["../../../.nvm/versions/node/v8.4.0/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","hQueryTests.js"], null)
//# sourceMappingURL=/hQueryTests.d07c391e.map