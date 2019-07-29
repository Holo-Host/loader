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

  constructor (window, targetContext) {
    if (!targetContext) {
      throw Error('Need to specify targetContext MessageBus will send messages to')
    }

    this._window = window
    this._targetContext = targetContext
    this._attachGlobalListener()
  }

  _attachGlobalListener = () => {
    this._window.addEventListener('message', this._handleGlobalMessage)
  }

  _sendMessage = (action, payload = null) => {
    if (!this._channel) {
      return
    }

    this._channel.postMessage(createMessage({ action, payload }))
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
    if (this._pubSub) {
      // Publish RESET event, so that MessageBus user can be aware of the event
      // and abort it's actions if necessary (eg. sending sensitive data
      // to wrong consumer/app)
      this._pubSub.publish(BUS_CHANNEL_RESET)
      return
    }

    this._pubSub = new MessageBusPubSub()
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

    this._setChannel(ports[0])
    this._setupPubSub()
    this._attachChannelListener(ports[0])
  }

  _handleChannelMessage = ({ data: { message } = {} } = {}) => {
    if (message === BUS_CHANNEL_INIT_ACK) {
      this._channelAck = true
      console.log('MessageBusProvider: Successfully set the messaging channel')
      return
    }

    if (!message.action) {
      console.warn('MessageBus received malformed message')
      return
    }

    this._pubSub.publish(message.action, message.payload)
  }
}
