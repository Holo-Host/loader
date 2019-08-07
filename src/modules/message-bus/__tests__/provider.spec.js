import MessageBusProvider from '../provider'
import MessageBusPubSub from '../pubsub'
import { BUS_CHANNEL_SETUP_INIT, BUS_CHANNEL_INIT_ACK, REQEUST_SUCCESS_ACTION_SUFFIX, REQEUST_FAILURE_ACTION_SUFFIX, REQEUST_ACTION_SUFFIX } from '../const'
import { createMessage } from '../common'

jest.spyOn(global.console, 'warn').mockImplementation(() => jest.fn())

const mockPubSubPublish = jest.fn()
jest.mock('../pubsub', () => {
  return jest.fn(() => {
    return { publish: mockPubSubPublish }
  })
})

describe('MessageBusProvider', () => {
  beforeEach(() => {
    MessageBusPubSub.mockClear()
    mockPubSubPublish.mockClear()
  })

  describe('constructor', () => {
    /* eslint-disable no-new */
    it('should throw error when there\'s no window specified', () => {
      expect(() => {
        new MessageBusProvider(undefined, {})
      }).toThrow()
    })

    it('should throw error when there\'s no target context specified', () => {
      expect(() => {
        new MessageBusProvider({})
      }).toThrow()
    })

    it('should listen for channel init messages on window', () => {
      const mockWindow = {
        addEventListener: jest.fn()
      }

      new MessageBusProvider(mockWindow, {})
      expect(mockWindow.addEventListener).toBeCalledWith('message', expect.any(Function))
    })

    it('should setup PubSub', () => {
      new MessageBusProvider(window, {})
      expect(MessageBusPubSub).toBeCalled()
    })
    /* eslint-enable no-new */
  })

  describe('_resetPubSub', () => {
    it('should publish BUS_CHANNEL_RESET event if PubSub is already initiated', () => {
      const bus = new MessageBusProvider(window, {})
      bus._setupPubSub()
      bus._resetPubSub()
      expect(mockPubSubPublish).toBeCalledWith('BUS_CHANNEL_RESET')
    })

    it('should not publish if PubSub is not initiated', () => {
      const bus = new MessageBusProvider(window, {})
      bus._resetPubSub()
      expect(mockPubSubPublish).toBeCalledWith('BUS_CHANNEL_RESET')
    })
  })

  describe('_handleGlobalMessage callback', () => {
    const mockContext = {
      contentWindow: Symbol('some window')
    }
    let bus

    beforeEach(() => {
      bus = new MessageBusProvider(window, mockContext)
      bus._resetPubSub = jest.fn()
      bus._clearMessageQueue = jest.fn()
      bus._setChannel = jest.fn()
      bus._attachChannelListener = jest.fn()
      bus._listenForRequestUpdates = jest.fn()
    })

    const correctParams = {
      source: mockContext.contentWindow,
      data: {
        message: BUS_CHANNEL_SETUP_INIT
      },
      ports: []
    }

    const expectNothingToBeDone = () => {
      expect(bus._resetPubSub).not.toBeCalled()
      expect(bus._clearMessageQueue).not.toBeCalled()
      expect(bus._setChannel).not.toBeCalled()
      expect(bus._attachChannelListener).not.toBeCalled()
      expect(bus._listenForRequestUpdates).not.toBeCalled()
    }

    describe('short-circuit checks', () => {
      it('should do nothing when source is not targetContext window', () => {
        bus._handleGlobalMessage({
          ...correctParams,
          source: 'some-window'
        })

        expectNothingToBeDone()
      })

      it('should do nothing when message is not BUS_CHANNEL_SETUP_INIT', () => {
        bus._handleGlobalMessage({
          ...correctParams,
          data: { message: 'some-message' }
        })

        expectNothingToBeDone()
      })

      it('should do nothing when there are no ports provided', () => {
        bus._handleGlobalMessage({
          ...correctParams,
          ports: undefined
        })

        expectNothingToBeDone()
      })
    })

    describe('channel ack check', () => {
      it('should reset PubSub if the channel is acknowledged', () => {
        bus._channelAck = true
        bus._handleGlobalMessage(correctParams)

        expect(bus._resetPubSub).toBeCalled()
      })

      it('should not reset PubSub if the channel is not acknowledged', () => {
        bus._channelAck = false
        bus._handleGlobalMessage(correctParams)

        expect(bus._resetPubSub).not.toBeCalled()
      })

      it('should clear message queue if the channel is acknowledged', () => {
        bus._channelAck = true
        bus._handleGlobalMessage(correctParams)

        expect(bus._clearMessageQueue).toBeCalled()
      })

      it('should not clear message queue if the channel is not acknowledged', () => {
        bus._channelAck = false
        bus._handleGlobalMessage(correctParams)

        expect(bus._clearMessageQueue).not.toBeCalled()
      })
    })

    it('should set channel with first port supplied', () => {
      const somePort = Symbol('some port')

      bus._handleGlobalMessage({
        ...correctParams,
        ports: [somePort]
      })

      expect(bus._setChannel).toBeCalledWith(somePort)
    })

    it('should attach channel listener on first port supplied', () => {
      const somePort = Symbol('some port')

      bus._handleGlobalMessage({
        ...correctParams,
        ports: [somePort]
      })

      expect(bus._attachChannelListener).toBeCalledWith(somePort)
    })

    it('should attach listener for Request messages', () => {
      bus._handleGlobalMessage(correctParams)

      expect(bus._listenForRequestUpdates).toBeCalled()
    })

    it('should not throw when function params are not correct', () => {
      expect(() => {
        bus._handleGlobalMessage()
      }).not.toThrow()
    })
  })

  describe('_handleChannelMessage callback', () => {
    let bus

    beforeEach(() => {
      bus = new MessageBusProvider(window, {})
      bus._handleAck = jest.fn()
      bus._pubSub.publish = jest.fn()
    })

    it('should not throw when function params are not correct', () => {
      expect(() => {
        bus._handleChannelMessage()
      }).not.toThrow()
    })

    it('should handle channel acknowledgement on BUS_CHANNEL_INIT_ACK message', () => {
      bus._handleChannelMessage({
        data: {
          message: BUS_CHANNEL_INIT_ACK
        }
      })

      expect(bus._handleAck).toBeCalled()
    })

    it('should not handle channel acknowledgement on other messages', () => {
      bus._handleChannelMessage({
        data: {
          message: 'some message'
        }
      })

      expect(bus._handleAck).not.toBeCalled()
    })

    it('should do nothing when channel is not acknowledged yet', () => {
      bus._channelAck = false
      bus._handleChannelMessage({
        data: {
          message: { action: 'some-action' }
        }
      })

      expect(bus._pubSub.publish).not.toBeCalled()
    })

    it('should do nothing when there is no action in message', () => {
      bus._channelAck = true
      bus._handleChannelMessage({
        data: {
          message: { some: 'other-format' }
        }
      })

      expect(bus._pubSub.publish).not.toBeCalled()
    })

    it('should publish message to Pub Sub otherwise', () => {
      const message = { action: 'some-action', payload: 'some-payload' }
      bus._channelAck = true
      bus._handleChannelMessage({
        data: { message }
      })

      expect(bus._pubSub.publish).toBeCalledWith(message.action, message.payload)
    })
  })

  describe('_handleAck', () => {
    it('should set the channel acknowledge flag', () => {
      const bus = new MessageBusProvider(window, {})
      bus._channelAck = false

      bus._handleAck()

      expect(bus._channelAck).toBe(true)
    })

    it('should trigger message queue processing', () => {
      const bus = new MessageBusProvider(window, {})
      bus._processMessageQueue = jest.fn()

      bus._handleAck()

      expect(bus._processMessageQueue).toBeCalled()
    })
  })

  describe('_processMessageQueue', () => {
    it('should send queued messages', () => {
      const queue = [Symbol(1), Symbol('two'), Symbol('tres')]
      const bus = new MessageBusProvider(window, {})
      bus._sendMessage = jest.fn()
      bus._messageQueue = [...queue]

      bus._processMessageQueue()

      expect(bus._sendMessage).toHaveBeenCalledTimes(3)
      expect(bus._sendMessage).toHaveBeenNthCalledWith(1, queue[0])
      expect(bus._sendMessage).toHaveBeenNthCalledWith(2, queue[1])
      expect(bus._sendMessage).toHaveBeenNthCalledWith(3, queue[2])
    })

    it('should leave the queue empty after processing all messages', () => {
      const bus = new MessageBusProvider(window, {})
      bus._sendMessage = jest.fn()
      bus._messageQueue = [Symbol(1), Symbol('two'), Symbol('tres')]

      bus._processMessageQueue()

      expect(bus._sendMessage).toHaveBeenCalledTimes(3)
      expect(bus._messageQueue).toEqual([])
    })

    it('should do nothing when there are no messages queued', () => {

    })
  })

  describe('_sendMessage', () => {
    it('should queue the message if the channel is not acknowledged yet', () => {
      const message = Symbol('some message')
      const bus = new MessageBusProvider(window, {})
      bus._channelAck = false

      bus._sendMessage(message)

      expect(bus._messageQueue).toContain(message)
    })

    it('should not send the message if the channel is not acknowledged yet', () => {
      const bus = new MessageBusProvider(window, {})
      bus._channel = { postMessage: jest.fn() }
      bus._channelAck = false

      bus._sendMessage(Symbol('some message'))

      expect(bus._channel.postMessage).not.toBeCalled()
    })

    it('should send a message on the channel', () => {
      const bus = new MessageBusProvider(window, {})
      bus._channel = { postMessage: jest.fn() }
      bus._channelAck = true

      bus._sendMessage(Symbol('some message'))

      expect(bus._channel.postMessage).toBeCalled()
    })

    it('should wrap sent message in additional metadata format', () => {
      const message = Symbol('some message')
      const bus = new MessageBusProvider(window, {})
      bus._channel = { postMessage: jest.fn() }
      bus._channelAck = true

      bus._sendMessage(message)

      expect(bus._channel.postMessage).toBeCalledWith(createMessage(message))
    })
  })

  describe('_handleRequestUpdate', () => {
    it('should ignore messages with request that is not registered as pending', () => {
      const payload = { actionProviderRequestId: 123 }
      const bus = new MessageBusProvider(window, {})

      expect(() => {
        bus._handleRequestUpdate('some-action', payload)
      }).not.toThrow()
    })

    it('should call success callback if action matches pending request action with success flag', () => {
      const action = 'some-action'
      const actionPayload = Symbol('some payload')
      const payload = {
        actionProviderRequestId: 123,
        actionPayload
      }
      const successSpy = jest.fn()
      const bus = new MessageBusProvider(window, {})
      bus._pendingRequests[123] = {
        action,
        success: successSpy
      }

      bus._handleRequestUpdate(action + REQEUST_SUCCESS_ACTION_SUFFIX, payload)

      expect(successSpy).toBeCalledWith(actionPayload)
    })

    it('should call failure callback if action matches pending request action with failure flag', () => {
      const action = 'some-action'
      const actionPayload = Symbol('some payload')
      const payload = {
        actionProviderRequestId: 123,
        actionPayload
      }
      const failureSpy = jest.fn()
      const bus = new MessageBusProvider(window, {})
      bus._pendingRequests[123] = {
        action,
        failure: failureSpy
      }

      bus._handleRequestUpdate(action + REQEUST_FAILURE_ACTION_SUFFIX, payload)

      expect(failureSpy).toBeCalledWith(actionPayload)
    })
  })

  describe('makeRequest', () => {
    it('should send a message with request', () => {
      const sendMessageSpy = jest.fn()
      const bus = new MessageBusProvider(window, {})
      bus._sendMessage = sendMessageSpy

      bus.makeRequest('some-action')

      expect(sendMessageSpy).toBeCalled()
    })

    it('should rewrite action in request model', () => {
      const action = 'some-action'
      const payload = Symbol('some payload')
      const sendMessageSpy = jest.fn()
      const bus = new MessageBusProvider(window, {})
      bus._sendMessage = sendMessageSpy

      bus.makeRequest(action, payload)

      expect(sendMessageSpy).toBeCalledWith(
        expect.objectContaining({
          action: action + REQEUST_ACTION_SUFFIX,
          payload: expect.objectContaining({
            actionPayload: payload
          })
        })
      )
    })

    it('should provide random request id', () => {
      const sendMessageSpy = jest.fn()
      const bus = new MessageBusProvider(window, {})
      bus._sendMessage = sendMessageSpy

      bus.makeRequest('some-action')

      expect(sendMessageSpy).toBeCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            actionProviderRequestId: expect.any(Number)
          })
        })
      )
    })

    it('should return Promise', () => {
      const action = 'some-action'
      const payload = Symbol('some payload')
      const bus = new MessageBusProvider(window, {})

      const request = bus.makeRequest(action, payload)

      expect(request).toEqual(expect.any(Promise))
    })
  })
})
