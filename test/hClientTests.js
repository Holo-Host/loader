describe("hClient: basic test", () => {

  it("should be able to override window.holochainClient", async () => {

  	// mock holochainClient
  	window.holochainClient = {
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
  	await window.holochainClient.connect("url1").then(({call}) => {
  		call("callString1")("params1").then(result => {
  			console.log(result)
  			firstCallResult = result
  		});
  	});
  	expect(firstCallResult).toBe("original result");

  	


  	// use hClient to override
  	const url = "ws://test"
  	const preCall = (callString, params) => ({callString, params});
  	const postCall = response => "override response";
  	const postConnect = ws => {};
  	hClient.overrideWebClient(url, preCall, postCall, postConnect);



	// make a call with the overriden version
  	let secondCallResult;
  	await window.holochainClient.connect().then(({call}) => {
  		call("callString1")("params1").then(result => {
  			console.log(result)
  			secondCallResult = result
  		});
  	});
  	expect(secondCallResult).toBe("override response");


  })
})
