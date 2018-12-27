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
    console.log('Got request', request)
    console.log(request.url)
    const URLNoProtocol = request.url.replace(/(^\w+:|^)\/\//, '');
    const subdomain = URLNoProtocol.split('.')[0]
    // 2) get hApp dna hash for request
    let content = 'key=' + subdomain
    let headers = {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
    const post = {
      method: 'POST',
      headers: headers,
      body: content
    }
    const hashResponse = await fetch('https://dns2dna.holohost.net', post)
    // 3) get IP tranche for dna hash
    // later

    // 4) process response
    const response = hashResponse
    console.log('Got response', response)
    return response
  } catch (err) {
    return new Response(err.stack || err)
  }
}
