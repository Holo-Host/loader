const hClient = require("../src/index.js")
const keyManagement = require("../src/keyManagement.js")

describe("hClient: basic test", () => {
  
  it("should be able to override window.holochainClient", async () => {

  	// mock holochainClient
  	const holochainClient = {
  		connect: (url) => new Promise((resolve) => {
  			console.log("connecting to ", url)

  			resolve({
  				call: (callString) => (params) => new Promise((resolve) => {
  					console.log(`${callString} was called with ${params}`);
  					resolve("original result");
  				})
  			});
  		})
  	}

  	// make a call with the original mock
  	let firstCallResult;
  	await holochainClient.connect("url1").then(({call}) => {
  		call("callString1")("params1").then(result => {
  			console.log(result)
  			firstCallResult = result
  	    firstCallResult.should.equal("original result");
      });
    });


  	// use hClient to override
  	const url = "ws://test"
  	const preCall = (callString, params) => ({callString, params});
  	const postCall = response => "override response";
  	const postConnect = ws => ws;
  	const holoClient = hClient.makeWebClient(holochainClient, url, preCall, postCall, postConnect);

	// make a call with the overriden version
  	let secondCallResult;
  	await holoClient.connect().then(({call}) => {
  		call("callString1")("params1").then(result => {
  			console.log(result)
  			secondCallResult = result
        secondCallResult.should.equal("override response");
  		});
  	});


  })
})

describe("keyManagement", () => {

  it("Can get 32 bytes of local entropy from webcrypto or sodium as a fallback", async () => {
    let entropy = await keyManagement.getLocalEntropy();
    entropy.byteLength.should.equal(32);
  });

  it("Can generate a local readonly keypair", async () => {

    let keypair = await keyManagement.generateReadonlyKeypair(
      keyManagement.getLocalEntropy,
      keyManagement.getLocalEntropy
    );
    keypair._signPub.byteLength.should.equal(32);
    keypair._signPriv.byteLength.should.equal(64);
  });

  it("Can generate a new readwrite keypair", async () => {

    const mockSaltRegistration = (email, salt) => salt;

    let keypair = await keyManagement.generateNewReadwriteKeypair(
      "test@test.com",
      "123abc",
      keyManagement.getLocalEntropy,
      keyManagement.getLocalEntropy,
      mockSaltRegistration
    );
    keypair._signPub.byteLength.should.equal(32);
    keypair._signPriv.byteLength.should.equal(64);
  });

  it("Can recover a keypair with an already registered salt", async () => {
    const mockGetRegisteredSalt = (email) => keyManagement.getLocalEntropy();

    let keypair = await keyManagement.regenerateReadwriteKeypair(
      "test@test.com",
      "123abc",
      mockGetRegisteredSalt
    );
    keypair._signPub.byteLength.should.equal(32);
    keypair._signPriv.byteLength.should.equal(64);
  });

})

