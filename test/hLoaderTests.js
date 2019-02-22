const hQuery = require("../web/hLoader");

describe("hLoader: insertScripts", () => {
  
  it("should add the correct override script to a simple HTML string", () => {
  	htmlString = "<html><body>original content</body></html>"
  	newString = hQuery.insertScripts(htmlString, "ws://")
    expect(newString)
    	.toBe(`<html><head><script src="hClient.js">hClient.init(ws://)</script></head><body>original content</body></html>`);
  })
})
