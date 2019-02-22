/**
 * keyManagement.js
 * 
 * Deals with managing how keys are stored in the browser local storage as well
 * as generating them on request either for readonly or read-write
 *
 * @param      {<type>}  hAppId  The application identifier
 * @return     {string}  The or generate readonly key.
 */

const { Keypair, RootSeed, randomBytes, pwHash } = require("../../dpki-lite.js/packages/dpki-lite/lib");
const Base64Binary = require("./base64-binary");

const saltmineUrl = "//saltmine.holohost.net";

const getRemoteEntropy = () => {
	return fetch(saltmineUrl, {
        method: "GET",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded", // Do not change or CORS will come and eat you alive (it does anyway!)
        }
    })
    .then(r => r.text())
    .then(Base64Binary.decodeArrayBuffer)
    .then((buffer) => new Uint8Array(buffer).slice(0,32));
}

const registerSalt = (email, salt) => {
    return fetch(saltmineUrl, {
        method: "POST",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded", // Do not change or CORS will come and eat you alive (it does anyway!)
        },
        body: new URLSearchParams({email, salt}),
    })
    .then(r => r.text())
    .then(Base64Binary.decodeArrayBuffer)
    .then((buffer) => new Uint8Array(buffer).slice(0,32));
}

const getRegisteredSalt = (email) => {
    return fetch(saltmineUrl, {
        method: "POST",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded", // Do not change or CORS will come and eat you alive (it does anyway!)
        },
        body: new URLSearchParams({email}),
    })
    .then(r => r.text())
    .then(Base64Binary.decodeArrayBuffer)
    .then((buffer) => new Uint8Array(buffer).slice(0,32));   
}

const getLocalEntropy = async () => {
    return await randomBytes(32);
}

const XorUint8Array = (a, b) => {
    let r = new Uint8Array(a.length);
    for(let i=0; i < a.length; i++) {
        r[i] = a[i]^b[i];
    }
    return r;
}

const generateReadonlyKeypair = async () => {
    const remoteEntropy = await getRemoteEntropy();
    const localEntropy = await getLocalEntropy();
    const seed = XorUint8Array(remoteEntropy, localEntropy);
    const keypair = await Keypair.newFromSeed(seed);
    return keypair;
}

const generateNewReadwriteKeypair = async (email, password) => {
    const remoteEntropy = await getRemoteEntropy();
    const localEntropy = await getLocalEntropy();
    const salt = XorUint8Array(remoteEntropy, localEntropy);
    const registeredSalt = await registerSalt(email, salt);
    const seed = await pwHash(password, registeredSalt);
    const keypair = await Keypair.newFromSeed(seed);
    return keypair;
}

const regenerateReadwriteKeypair = async (email, password) => {
    const registeredSalt = await getRegisteredSalt(email);
    const seed = await pwHash(password, registeredSalt);
    const keypair = await Keypair.newFromSeed(seed);
    return keypair;
}


module.exports = {
    getRemoteEntropy,
    getLocalEntropy,
	generateReadonlyKeypair,
    generateNewReadwriteKeypair,
};