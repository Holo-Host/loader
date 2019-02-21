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

/**
 * Checks the browser storage for a key pair for this hApp ID
 * If one exists returns it immediatly else initiates the key 
 * generation process either silently (for readonly) or via the login 
 * page for readwrite keys
 *
 * @param      {<type>}   hAppId    The application identifier
 * @param      {boolean}  readonly  The readonly
 * @return     {dpki-lite::Keypair}   The loaded or generated keypair
 */
const getOrGenerateKey = async (hAppId, readonly=true) => {

	if (readonly) {
		
		const seed = await util.randomBytes(32)
		console.log("seed is:", seed)
		const keypair = Keypair.newFromSeed(seed)

		const passphrase = "";
		const hint = "There is no passphrase";
		storeBundle(hAppId, keypair.getBundle(passphrase, hint), readonly=true);

	} else {

	}
}


module.exports = {
	getOrGenerateKey
};