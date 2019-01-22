addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/**
 * Request is to add IP to tranche for a given DNA
 * Request must include DNA and IP
 * TODO:  1) Check current tranche for duplicate
 * TODO:  2) If no duplicate, add IP, else something
 * TODO: the "else something"
 * TODO: Log request and response somewhere???
 * @param {Request} request
 */
async function handleRequest(request) {
  //console.log('Got request', request)
  let requestHeaders = JSON.stringify([...request.headers], null, 2)
  //console.log(`Request headers: ${requestHeaders}`)
  //console.log(request);
  let responseStatus = 500;
  let responseBody = {};
  let responseInit = {}
  // Wrap code in try/catch block to return error stack in the response body
  try {
    // Check request parameters first
    if (request.method.toLowerCase() !== 'post') {
      responseStatus = 400;
    // Content-Type application/x-www-form-urlencoded
    } else if (request.headers.get("Content-Type") !== 'application/x-www-form-urlencoded') {
      responseStatus = 415;
    } else {
      // get form data
      const data = await request.formData();
      // console.log(data)
      // check for auth_key
      // else invalid
      // using hartzog's auth_key for now
      // d161a0a06eba2080c19a327af7dc0cb935af0
      // TODO: move auth_key to TOKEN_STORE or SECRETS_VAULT
      const auth_key = data.get('auth_key')
      console.log("auth_key", auth_key)
      if(auth_key!=="d161a0a06eba2080c19a327af7dc0cb935af0"){
        // invalid
        console.log("auth_key invalid")
        responseStatus = 403;
      } else {
        console.log("auth_key VALID")
        // check for ip and dna (both required)
        // else invalid
        let ip = data.get('ip')
        console.log("ip", ip)
        let dna = data.get('dna')
        console.log("dna", dna)
        // this could be done with an OR (||) but
        // we have more control if we don't
        // (!ip || !dna)
        if(!ip){
          console.log("ip missing")
          responseStatus = 400;
        } else {
          if(!dna){
            console.log("dna missing")
            responseStatus = 400;
          } else {
            // we have everything so request is valid
            console.log("all parameters VALID")

            // process request
            // put key,value into queue
            // Cloudflare will ignore duplicate keys
            // we can check for duplicates later
            //   so we can have nice error message
            // At present there is no way to verify
            // the ".put" command succeeds
            // According to documentation
            // eventual consistency < 10 seconds globally
            // Be sure these are strings
            ip = ip.toString()
            dna = dna.toString()
            console.log("putting", ip + " " + dna)
            IP_DNA_QUEUE.put(ip, dna)
            responseStatus = 200;
          }
        }
      }
    }
    // return Response
    // default responseStatus is 500, see above
    responseInit = {
      status: responseStatus,
      headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
      }
    }
    console.log(responseStatus, responseBody)
    return new Response(JSON.stringify(responseBody), responseInit);

  } catch (e) {
      // Display the error stack.
      return new Response(e.stack || e)
  }
}
