/**
 * keyManagement.js
 * 
 * Deals with managing how keys are stored in the browser local storage as well
 * as generating them on request either for readonly or read-write
 *
 * @param      {<type>}  hAppId  The application identifier
 * @return     {string}  The or generate readonly key.
 */

const { Keypair, RootSeed, util } = require("../../dpki-lite.js/packages/dpki-lite/lib");
const { storeKeyBundle, loadKeyBundle } = require("./persistence");

/**
 * Checks the browser storage for a key pair for this hApp ID
 * If one exists returns it immediatly else initiates the key 
 * generation process either silently (for readonly) or via the login 
 * page for readwrite keys
 *
 * @param      {<type>}   hAppId    The application identifier
 * @param      {boolean}  canWrite  If a write key is required or if a readonly will suffice
 * @return     {dpki-lite::Keypair}   The loaded or generated keypair
 */
const getOrGenerateKey = async (hAppId, canWrite=true) => {

	if (canWrite) {
		// try and load a write key and if there is none or a readonly then trigger login
	} else {
		// try and load a readonly key or just generate and store a new random one
	}
	const seed = await util.randomBytes(32);
	console.log("seed is: ", seed);
	const keypair = await Keypair.newFromSeed(seed);
	console.log("keypair is: ", keypair);
	return keypair;
}


module.exports = {
	getOrGenerateKey
};