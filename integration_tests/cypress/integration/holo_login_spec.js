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
			response: {"requestURL":"/","dna":"QmSimpleHappHash","hosts":["localhost:4000"]},
		});

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