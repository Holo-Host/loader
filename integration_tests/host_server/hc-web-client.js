// mock holochainClient
window.holochainclient = {
  connect: (url) => new Promise((resolve) => {
    console.log("Mock: connecting to ", url)
    resolve({
      call: (callString) => (params) => new Promise((resolve) => {
      	const paramsStr = JSON.stringify(params)
        console.log(`Mock: ${callString} was called with ${paramsStr}`);
        // just echo the params as the response. Allows for mocking different error codes
        resolve(paramsStr);
      })
    });
  })
}