const hQuery = require("../web/hQuery.js");

describe("hQuery: insertScripts", () => {

  
  it("should add the correct override script to a simple HTML string", () => {
  	htmlString = "<html><body>original content</body></html>"
  	newString = hQuery.insertScripts(htmlString, "ws://")
    expect(newString)
    	.toBe(`<html><head><script src="hClient.js">hClient.overrideWebClient(ws://)</script></head><body>original content</body></html>`);
  })
})
