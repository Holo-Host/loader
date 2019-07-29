import { BUS_CHANNEL_SETUP_INIT, BUS_CHANNEL_INIT_ACK } from './const'
import { createMessage } from './common'

const DEFAULT_ORIGIN_SELECTOR = '*'

export default class MessageBusConsumer {
  _subscribers = []

  _window = null

  _channel = null

  _channelAck = false

  _ackTimeout = null

  constructor (window) {
    this._window = window
    this._initChannel()
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
  }

  _handleChannelMessage = ({ data: { message } = {} } = {}) => {
    if (!message) {
      return
    }

    if (message === BUS_CHANNEL_INIT_ACK) {
      this._handleAck()
    }

    if (!this._channelAck) {
      console.warn('MessageBusConsumer got message on the channel before the connection was acknowledged')
    }
  }

  _handleAck = () => {
    this._channelAck = true
    this._channel.postMessage(createMessage(BUS_CHANNEL_INIT_ACK))
  }

  _sendMessage = (action, payload) => {
    this._channel.postMessage(
      createMessage({ action, payload })
    )
  }
}
