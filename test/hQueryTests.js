describe("addConnectionUrlScript", () => {

  it("should add a <script> tag to an empty html document", () => {
  	htmlString = "<html><body>original content</body></html>"
  	newString = addConnectionUrlScript(htmlString, "ws://")
    expect(newString)
    	.toBe("<html><head><script>window.holochainUrl=ws://</script></head><body>original content</body></html>");
  })

})