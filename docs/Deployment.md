# Holo loader deployment notes

*Following notes describe necessary headers on the static files served from loader.holo.host*

### Caching
- .html files need to have no caching set in testing, in production we can set them to certain date (good idea?)
    - Cache-control: no-cache
    - Let's make use of an eTag
- .js files need 1 year caching. We handle vesioning by adding version in a querry string of url: .hQuery?v=0.0.1
    - Cache-control: 31536000
- hApp content caching is handled on the container lever that sets right headers for served content

### Deployment process

- all the .js files need to pass tests
- all the .js files need to be babel-transpiled to ES5 and minified
- we need to replace *.js with *.min.js?v=x.x.x in all .html files on loader.holohost.net
