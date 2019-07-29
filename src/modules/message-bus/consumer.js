import { createMessage } from './common'
import MessageBusPubSub from './pubsub'
import { BUS_CHANNEL_SETUP_INIT, BUS_CHANNEL_INIT_ACK } from './const'

const DEFAULT_ORIGIN_SELECTOR = '*'

export default class MessageBusConsumer {
  _subscribers = []

  _window = null

  _channel = null

  _channelAck = false

  _pubSub = null

  _messageQueue = []

  constructor (window) {
    this._window = window
    this._initChannel()
    this._attachListener()
    this._setupPubSub()
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

  sendMessage = (action, payload = null) => {
    this._sendMessage({ action, payload })
  }

  subscribe = (callback, eventType) => this._pubSub.subscribe(callback, eventType)
}
