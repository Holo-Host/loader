import { createMessage, requiredField } from './common'
import MessageBusPubSub from './pubsub'
import {
  BUS_CHANNEL_SETUP_INIT,
  BUS_CHANNEL_RESET,
  BUS_CHANNEL_INIT_ACK,
  REQEUST_ACTION_SUFFIX,
  REQEUST_SUCCESS_ACTION_SUFFIX,
  REQEUST_FAILURE_ACTION_SUFFIX
} from './const'

export default class MessageBusProvider {
  _window = null

  _targetContext = null

  _channel = null

  _channelAck = false

  _pubSub = null

  _messageQueue = []

  _pendingRequests = {}

  constructor (
    window = requiredField('Need to specify window context MessageBus will listen to messages on'),
    targetContext = requiredField('Need to specify targetContext MessageBus will send messages to')
  ) {
    this._window = window
    this._targetContext = targetContext
    this._attachGlobalListener()
    this._setupPubSub()
  }

  _attachGlobalListener = () => {
    this._window.addEventListener('message', this._handleGlobalMessage)
  }

  _setChannel = channel => {
    this._channelAck = false

    if (!channel.postMessage) {
      throw Error('Expected channel to provide postMessage API')
    }

    this._channel = channel
    this._channel.postMessage(createMessage(BUS_CHANNEL_INIT_ACK))
  }

  _attachChannelListener = channel => {
    channel.onmessage = this._handleChannelMessage
  }

  _setupPubSub = () => {
    this._pubSub = new MessageBusPubSub()
  }

  _resetPubSub = () => {
    if (!this._pubSub) {
      return
    }

    // Publish RESET event, so that MessageBus user can be aware of the event
    // and abort it's actions if necessary (eg. sending sensitive data
    // to wrong consumer/app)
    this._pubSub.publish(BUS_CHANNEL_RESET)
  }

  _handleGlobalMessage = ({ source, data: { message } = {}, ports } = {}) => {
    if (
      // Message from foreign context - ignore
      source !== this._targetContext.contentWindow ||
      // Unsupported action
      message !== BUS_CHANNEL_SETUP_INIT ||
      // Expect message channel to be passed via ports
      !ports
    ) {
      return
    }

    if (this._channelAck) {
      this._resetPubSub()
      this._clearMessageQueue()
    }

    this._setChannel(ports[0])
    this._attachChannelListener(ports[0])
    this._listenForRequestUpdates()
  }

  _handleChannelMessage = ({ data: { message } = {} } = {}) => {
    if (message === BUS_CHANNEL_INIT_ACK) {
      this._handleAck()
      return
    }

    if (!this._channelAck) {
      console.warn('MessageBusProvider got message on the channel before the connection was acknowledged')
      return
    }

    if (!message || !message.action) {
      console.warn('MessageBus received malformed message')
      return
    }

    this._pubSub.publish(message.action, message.payload)
  }

  _handleAck = () => {
    this._channelAck = true
    console.info('MessageBusProvider: Successfully set the messaging channel')
    this._processMessageQueue()
  }

  _processMessageQueue = () => {
    while (this._messageQueue.length) {
      const message = this._messageQueue.shift()
      this._sendMessage(message)
    }
  }

  _clearMessageQueue = () => {
    // Used for clearing the queue when the channel is being reset - don't leak any
    // messages to wrong consumer
    this._messageQueue = []
  }

  _sendMessage = (message) => {
    if (!this._channelAck) {
      this._messageQueue.push(message)
      return
    }

    this._channel.postMessage(createMessage(message))
  }

  _listenForRequestUpdates = () => {
    this.subscribe(this._handleRequestUpdate)
  }

  _handleRequestUpdate = (action, payload = {}) => {
    const requestId = payload.actionProviderRequestId
    if (!requestId) {
      // Message that isn't the request
      return
    }

    const request = this._pendingRequests[requestId]
    if (!request) {
      console.warn('MessageBusProvider: Couldn\'t find pending request with requestId from the message')
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

    console.warn('MessageBusProvider: Found pending request with requestId from the message, but message action could not be recognized')
  }

  subscribe = (callback, eventType) => this._pubSub.subscribe(callback, eventType)

  sendMessage = (action, payload = null) => {
    this._sendMessage({ action, payload })
  }

  makeRequest = (action, payload) => {
    const actionProviderRequestId = Math.floor(Math.random() * 100000)
    const request = {
      action: action + REQEUST_ACTION_SUFFIX,
      payload: {
        actionProviderRequestId,
        actionPayload: payload
      }
    }

    this._sendMessage(request)

    return new Promise((resolve, reject) => {
      this._pendingRequests[actionProviderRequestId] = { action, success: resolve, failure: reject }
    })
  }
}
