import { createMessage } from './common'
import MessageBusPubSub from './pubsub'
import { BUS_CHANNEL_SETUP_INIT, BUS_CHANNEL_INIT_ACK, REQEUST_ACTION_SUFFIX, REQEUST_SUCCESS_ACTION_SUFFIX, REQEUST_FAILURE_ACTION_SUFFIX } from './const'

const DEFAULT_ORIGIN_SELECTOR = '*'

export default class MessageBusConsumer {
  _subscribers = []

  _window = null

  _channel = null

  _channelAck = false

  _pubSub = null

  _messageQueue = []

  _pendingRequests = {}

  constructor (window) {
    this._window = window
    this._initChannel()
    this._setupPubSub()
    this._attachListener()
  }

  _initChannel () {
    const channel = new MessageChannel()
    this._channel = channel.port1

    this._window.top.postMessage(
      createMessage(BUS_CHANNEL_SETUP_INIT),
      DEFAULT_ORIGIN_SELECTOR,
      [channel.port2]
    )
  }

  _attachListener = () => {
    this._channel.onmessage = this._handleChannelMessage
    this._listenForRequestUpdates()
  }

  _setupPubSub = () => {
    this._pubSub = new MessageBusPubSub()
  }

  _handleChannelMessage = ({ data: { message } = {} } = {}) => {
    if (!message) {
      return
    }

    if (message === BUS_CHANNEL_INIT_ACK) {
      this._handleAck()
      return
    }

    if (!this._channelAck) {
      console.warn('MessageBusConsumer got message on the channel before the connection was acknowledged')
      return
    }

    if (!message.action) {
      console.warn('MessageBus received malformed message')
      return
    }

    this._pubSub.publish(message.action, message.payload)
  }

  _handleAck = () => {
    this._channelAck = true
    this._sendMessage(BUS_CHANNEL_INIT_ACK)
    this._processMessageQueue()
  }

  _processMessageQueue = () => {
    while (this._messageQueue.length) {
      const message = this._messageQueue.shift()
      this._sendMessage(message)
    }
  }

  _sendMessage = (message) => {
    if (!this._channelAck) {
      this._messageQueue.push(message)
      return
    }

    this._channel.postMessage(
      createMessage(message)
    )
  }

  _listenForRequestUpdates = () => {
    this.subscribe(this._handleRequestUpdate)
  }

  _handleRequestUpdate = (action, payload = {}) => {
    const requestId = payload.actionConsumerRequestId
    if (!requestId) {
      // Message that isn't the request
      return
    }

    const request = this._pendingRequests[requestId]
    if (!request) {
      console.warn('MessageBusConsumer: Couldn\'t find pending request with requestId from the message')
      return
    }

    if (action === request.action + REQEUST_SUCCESS_ACTION_SUFFIX) {
      request.success(payload.actionPayload)
      delete this._pendingRequests[requestId]
      return
    }

    if (action === request.action + REQEUST_FAILURE_ACTION_SUFFIX) {
      request.failure(payload.actionPayload)
      delete this._pendingRequests[requestId]
      return
    }

    console.warn('MessageBusConsumer: Found pending request with requestId from the message, but message action could not be recognized')
  }

  subscribe = (callback, eventType) => this._pubSub.subscribe(callback, eventType)

  sendMessage = (action, payload = null) => {
    this._sendMessage({ action, payload })
  }

  makeRequest = (action, payload) => {
    const actionConsumerRequestId = Math.floor(Math.random() * 100000)
    const request = {
      action: action + REQEUST_ACTION_SUFFIX,
      payload: {
        actionConsumerRequestId,
        actionPayload: payload
      }
    }

    this._sendMessage(request)

    return new Promise((resolve, reject) => {
      this._pendingRequests[actionConsumerRequestId] = { action, success: resolve, failure: reject }
    })
  }
}
