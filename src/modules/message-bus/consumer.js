const DEFAULT_ORIGIN_SELECTOR = '*'
const INIT_BUS_CHANNEL_MESSAGE = 'INIT_MESSAGE_BUS_CHANNEL'

export default class MessageBusConsumer {
  _subscribers = []

  _window = null

  _channel = null

  constructor (window) {
    this._window = window
    this._initChannel()
    this._attachListener()
  }

  _initChannel () {
    const channel = new MessageChannel()
    this._channel = channel

    this._window.top.postMessage(INIT_BUS_CHANNEL_MESSAGE, DEFAULT_ORIGIN_SELECTOR, [
      channel.port2
    ])
    channel.port1.postMessage('test message from consumer')
  }

  _attachListener = () => {
    this._channel.port1.onmessage = this._handleMessage
  }

  _handleMessage = ({ origin, source, data } = {}) => {
    console.log('consumer got message', data)
  }

  subscibe () {}

  request () {
    return Promise()
  }
}
