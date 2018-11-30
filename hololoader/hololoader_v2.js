const loadAndReplace = url => {
  fetch(url)
    .then(r => r.text())
    .then(html => {
      const newHtml = addBaseRaw(html, url)
      document.open("text/html", "replace")
      document.write(newHtml)
      document.close()
    })
}

const addBaseRaw = (html, url) => {
  // TODO: make this more robust with a real HTML parser.
  // For instance, this fails on something weird like:
  // <head data-lol=">">
  return html.replace(/<head(.*?)>/, `<head$1><base href="${url}"/>`)
}

/**
 * Inject <base> the proper way. The only problem is, by the time it gets injected,
 * the <head> has been parsed and attempts have been made to fetch the wrong URLs.
 * Probably won't work, use addBaseRaw instead. TODO: remove
 */
const addBaseElement = (url) => {
  const {head} = document
  const base = document.createElement('base')
  base.setAttribute('href', url)
  head.insertBefore(base, head.firstChild)
}

/**
 * Experimental iframe injection as a Plan B. Currently doesn't work.
 */
const setupIframe = url => {
  const iframe = document.createElement('iframe')
  iframe.src = url
  document.body.appendChild(iframe)
}

/**
 * Get URL of a (proxied) host from which to serve up the app UI
 */
const hostUrl = () => {
  const {hostname, protocol} = window.location
  if (hostname === 'localhost') {
    return `${protocol}//localhost:3000/`
  }
}

const main = () => loadAndReplace(hostUrl())
window.addEventListener('load', main)
