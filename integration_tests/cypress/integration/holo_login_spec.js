// import 'whatwg-fetch'

describe('The integration test page', function() {

	let polyfill

	// grab fetch polyfill from remote URL, could be also from a local package
	before(() => {
	    const polyfillUrl = 'https://unpkg.com/unfetch/dist/unfetch.umd.js'
	    cy.request(polyfillUrl)
	    .then((response) => {
	      polyfill = response.body
	    })
	})

	beforeEach(function () {
		cy.server();

		// mock the resolver
		cy.route({
			method: 'POST',
			url: 'http://resolver.holohost.net/',
			response: {"requestURL":"/","dna":"QmSimpleHappHash","hosts":["haaaaaaaash.holo.host/"]},
		});

		// mock the resolved holo host returning the html for the site and the holoclient.js
		cy.route({
			method: 'GET',
			url: 'http://haaaaaaaash.holo.host',
			response: "fixture:simpleapp.html",
		});
		cy.route({
			method: 'GET',
			url: 'http://haaaaaaaash.holo.host/holoclient.js',
			response: "fixture:holoclient.js",
		});

		// hClient.js and login.html are effectively mocked by being hosted by the same webserver

		cy.visit('/', {
	      onBeforeLoad (win) {
	        delete win.fetch
	        // since the application code does not ship with a polyfill
	        // load a polyfilled "fetch" from the test
	        win.eval(polyfill)
	        win.fetch = win.unfetch
	      },
		});
	})


	it('successfully loads', function() {

	})
})