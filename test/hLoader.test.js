const hQuery = require("../web/hLoader");

describe("hLoader: insertScripts", () => {
  
  it("should add the correct base tag to the head", () => {
  	htmlString = "<html><body>original content</body></html>"
  	newString = hQuery.replaceBase(htmlString, "ws://")
    expect(newString)
    	.toBe(`<html><head><base href="ws://"></head><body>original content</body></html>`);
  })
  
})
