const WebSocketServer = require('rpc-websockets').Server

const port = 4001
let callbackId = 0

const server = new WebSocketServer({
  port: 4001,
  host: 'localhost'
})

// server.event('agent/sign')

server.register('holo/identify', ({agentId}) => {
	server.event(`agent/${agentId}/sign`)
	return {Ok: true}
})

server.register('holo/call', ({
  agentId, 
  happId, 
  dnaHash, 
  function: func, 
  params,
  signature,
}) => {
	switch(func) {
		case "instance/zome/valid_function":
			return JSON.stringify({Ok: "Some response"})
		case "instance/zome/unauthorized_function":
			return JSON.stringify({Err: {code: 401}})
		case "instance/zome/needs_sig_function":
			server.emit(`agent/${agentId}/sign`, {entry: "fake_entry_string", id: callbackId++})
			return JSON.stringify({Ok: true})
		default:
			return JSON.stringify({Err: "no such function"})
	}
})

server.register('holo/clientSignature', ({signature, requestId}) => {
	console.log("signature received with", signature, requestId)
	return {Ok: true}
})

console.log("websocket listening in port ", port)