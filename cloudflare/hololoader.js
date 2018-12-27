// main eventListener
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
/**
 * Fetch and log a given request object
 * @param {Request} request
 */
async function handleRequest(request) {
  try {
    // 1) process request
    //console.log('Got request', request)
    console.log('Request', request.url)
    const URLNoProtocol = request.url.replace(/(^\w+:|^)\/\//, '');
    const subdomain = URLNoProtocol.split('.')[0]
    // 2) get hApp dna hash for request
    let content = 'key=' + subdomain
    let headers = {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
    let post = {
      method: 'POST',
      headers: headers,
      body: content
    }
    const hashResponse = await fetch('https://dns2dnadev.holohost.net', post)
    const dna = await hashResponse.json();
    //console.log(dna)
    // error check DNA result
    let validDNA = false
    if(!dna.startsWith("Error:")){
      validDNA = true
    }
    let trancheResponse = null
    let validTranche = false
    const JSONHeader = {
      headers: {'Content-Type': 'application/json'}
    }
    let tranche = null
    if(validDNA){
      // 3) get IP tranche for dna hash
      // we can reuse headers from before
      content = 'key=' + dna
      post = {
        method: 'POST',
        headers: headers,
        body: content
      }
      trancheResponse = await fetch('https://dna2tranchedev.holohost.net', post)
      // error check tranche result
      tranche = await trancheResponse.json()
      //console.log(tranche)

    }
    // 4) process response
    let combined = {}
    combined['dna'] = dna
    if(validDNA){
      combined['tranche'] = tranche
    }
    response = new Response(JSON.stringify(combined), JSONHeader)
    //console.log('Prepared response', response)
    return response
  } catch (err) {
    return new Response(err.stack || err)
  }
}
