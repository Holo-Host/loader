import { createMessage } from './common'
import MessageBusPubSub from './pubsub'
import {
  BUS_CHANNEL_SETUP_INIT,
  BUS_CHANNEL_RESET,
  BUS_CHANNEL_INIT_ACK
} from './const'

export default class MessageBusProvider {
  _window = null

  _targetContext = null

  _channel = null

  _channelAck = false

  _pubSub = null

  _messageQueue = []

  constructor (window, targetContext) {
    if (!targetContext) {
      throw Error('Need to specify targetContext MessageBus will send messages to')
    }

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

  _handleGlobalMessage = ({ source, data, ports } = {}) => {
    if (
      // Message from foreign context - ignore
      source !== this._targetContext.contentWindow ||
      // Unsupported action
      data.message !== BUS_CHANNEL_SETUP_INIT ||
      // Expect message channel to be passed via ports
      !ports
    ) {
      return
    }

    if (this._channelAck) {
      this._resetPubSub()
    }

    this._setChannel(ports[0])
    this._attachChannelListener(ports[0])
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
      console.warn('MessageBusProvider got message on the channel before the connection was acknowledged')
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
    console.log('MessageBusProvider: Successfully set the messaging channel')
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

    this._channel.postMessage(createMessage(message))
  }

  sendMessage = (action, payload = null) => {
    this._sendMessage({ action, payload })
  }

  subscribe = (callback, eventType) => this._pubSub.subscribe(callback, eventType)
}
