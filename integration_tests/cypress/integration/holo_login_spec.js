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

		// mock the saltmine
		cy.route({
			method: 'GET',
			url: 'http://saltmine.holohost.net/',
			response: '1c1d68e7a177de30392112bc8f8d64a7e45be2b33e865d6284c543cc01763593'
		});
		cy.route({
			method: 'POST',
			url: 'http://saltmine.holohost.net/',
			response: '1c1d68e7a177de30392112bc8f8d64a7e45be2b33e865d6284c543cc01763593',
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

	it('makes a call prior to authentication, authenticates, then calls again', () => {
		cy.wait(2000);
		cy.get("#make-valid-call").click();
		cy.wait(500);
		cy.get("#trigger-unauthorized").click();
		cy.wait(500);
		cy.get(".holo-dialog").within(() => {
			cy.get("input[name='email']").type("test@test.com");
			cy.get("input[name='pass']").type("abc123");
			cy.get("button").click();
		});
		cy.wait(500);
		cy.get("#make-valid-call").click();
		cy.wait(500);
	})
	
})