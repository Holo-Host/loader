/**
 * keyManagement.js
 *
 * Deals with managing how keys generated with the salt server
 *
 */

const { Keypair, randomBytes, pwHash } = require('../../dpki-lite.js/packages/dpki-lite/lib')
const Base64Binary = require('./base64-binary')

const saltmineUrl = '//saltmine.holohost.net'

/**
 * Make a call to the saltmine API
 *
 * @param      {string}      method  The HTTP method e.g. "POST"
 * @param      {Object}      params  Parameter to pass in the body
 * @return     {Promise}     Promise that resolves to the reponse
 */
const callSaltmine = (method, params) => {
  let body
  if (method === 'GET') {
    body = undefined
  } else {
    body = Object.keys(params).map((key) => {
      return encodeURIComponent(key) + '=' + encodeURIComponent(params[key])
    }).join('&')
  }
  return fetch(saltmineUrl, {
    method: method,
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded' // Do not change or CORS will come and eat you alive (it does anyway!)
    },
    body: body
  })
}

/**
 * Use the saltmine to retrieve 32 bytes of entropy
 *
 * @return     {Uint8Array}  The remote entropy.
 */
const getRemoteEntropy = () => {
  return callSaltmine('GET')
    .then(r => r.text())
    .then(Base64Binary.decodeArrayBuffer)
    .then((buffer) => new Uint8Array(buffer).slice(0, 32))
}

/**
 * Register some salt with a given email address
 *
 * @param      {string}      email   The email
 * @param      {Uint8Array}  salt    The salt
 * @return     {Promise}     If successful will resolve to the same salt again
 */
const registerSalt = (email, salt) => {
  return callSaltmine('POST', { email, salt })
    .then(r => r.text())
    .then(Base64Binary.decodeArrayBuffer)
    .then((buffer) => new Uint8Array(buffer).slice(0, 32))
}

/**
 * Gets the registered salt.
 *
 * @param      {string}      email   The email
 * @return     {Promise}  If successful will resolve to previously registered salt
 */
const getRegisteredSalt = (email) => {
  return callSaltmine('POST', { email })
    .then(r => r.text())
    .then(Base64Binary.decodeArrayBuffer)
    .then((buffer) => new Uint8Array(buffer).slice(0, 32))
}

/**
 * Generate 32 bytes of entropy locally using either webcrypto (preferred, unimplemented) or libsodium
 *
 * @return     {Uint8Array}  The local entropy.
 */
const getLocalEntropy = async () => {
  if (typeof window !== 'undefined' && window.crypto) {
    var array = new Uint8Array(32)
    window.crypto.getRandomValues(array)
    return array
  } else {
    console.log('Browser does not provide webcrypto. Falling back to libsodium (Warning: this may be less secure)')
    return randomBytes(32)
  }
}

/**
 * XOR two Uint8 arrays together.
 * Surely there is a better way to do this? This is the best I could find
 */
const XorUint8Array = (a, b) => {
  let r = new Uint8Array(a.length)
  for (let i = 0; i < a.length; i++) {
    r[i] = a[i] ^ b[i]
  }
  return r
}

/**
 * Full workflow for generating a new readonly key pair
 *
 * @parameter    {() => Promise}    remoteEntropyGenerator
 * @parameter    {() => Promise}    localEntropyGenerator
 * @return     {dpki-lite::Keypair}  The generated keypair object
 */
const generateReadonlyKeypair = async (
  remoteEntropyGenerator = getRemoteEntropy,
  localEntropyGenerator = getLocalEntropy
) => {
  const remoteEntropy = await remoteEntropyGenerator()
  const localEntropy = await localEntropyGenerator()
  const seed = XorUint8Array(remoteEntropy, localEntropy)
  const keypair = await Keypair.newFromSeed(seed)
  return keypair
}

/**
 * Full workflow for generating a new readwrite keypair given an email and password
 *
 * @param      {string}  email     The email
 * @param      {string}  password  The password
 * @parameter    {() => Promise}    remoteEntropyGenerator
 * @parameter    {() => Promise}    localEntropyGenerator
 * @param      {(email: string, salt: string) => Promise} saltRegistrationCallback
 */
const generateNewReadwriteKeypair = async (
  email,
  password,
  remoteEntropyGenerator = getRemoteEntropy,
  localEntropyGenerator = getLocalEntropy,
  saltRegistrationCallback = registerSalt
) => {
  const remoteEntropy = await remoteEntropyGenerator()
  const localEntropy = await localEntropyGenerator()
  const salt = XorUint8Array(remoteEntropy, localEntropy)
  const registeredSalt = await saltRegistrationCallback(email, salt)

  console.log('password', password)
  console.log('registerSalt', registeredSalt)

  // Unsure why pwHash is configured to use 16 bytes of salt not 32. Ask about this
  const { hash } = await pwHash(password, registeredSalt.slice(0, 16))
  const keypair = await Keypair.newFromSeed(hash)
  return keypair
}

/**
 * Full workflow for restoring a keypair given a user has already registered salt for
 * the given email address
 *
 * @param      {string}  email     The email
 * @param      {string}  password  The password
 * @param      {(email: string) => Promise} getRegisteredSaltCallback
 * @return     {dpki-lite::Keypair}  The generated keypair object
 */
const regenerateReadwriteKeypair = async (
  email,
  password,
  getRegisteredSaltCallback = getRegisteredSalt
) => {
  const registeredSalt = await getRegisteredSaltCallback(email)
  const { hash } = await pwHash(password, registeredSalt.slice(0, 16))
  const keypair = await Keypair.newFromSeed(hash)
  return keypair
}

module.exports = {
  getRemoteEntropy,
  getLocalEntropy,
  generateReadonlyKeypair,
  generateNewReadwriteKeypair,
  regenerateReadwriteKeypair
}
