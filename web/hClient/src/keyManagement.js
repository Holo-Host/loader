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

const saltmineUrl = "https://saltmine.holohost.net";

const generateReadonlyKey = () => {
	// get entropy from salt service
	fetch(saltmineUrl, {
        method: "GET",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded", // Do not change or CORS will come and eat you alive
        }
    }).then(r => {
    	console.log(r);
    });
}


module.exports = {
	generateReadonlyKey
};