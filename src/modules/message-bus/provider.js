const DEFAULT_ORIGIN_SELECTOR = '*';
const INIT_BUS_CHANNEL_MESSAGE = 'INIT_MESSAGE_BUS_CHANNEL';
const ALL_EVENTS = Symbol('All events');

export default class MessageBusProvider {
    _window = null;
    _targetContext = null;
    _channel = null;
    _subscribers = [];

    constructor(window, targetContext) {
        if (!targetContext) {
            throw Error('Need to specify targetContext MessageBus will send messages to');
        }

        this._window = window;
        this._targetContext = targetContext;
        this._attachListener();
        // targetContext.contentWindow.document.msgBus = 'abc';
    }

    _attachListener = () => {
        this._window.addEventListener('message', this._handleGlobalMessage);
    }

    _setChannel = (channel) => {
        if (!channel.postMessage) {
            throw Error('Expected channel to provide postMessage API')
            return
        }

        this._channel = channel;
    }

    _sendMessage = (action, payload) => {
        if (!this._channel) {
            return;
        }
        console.log('sending')
        this._channel.postMessage({ action, payload });
    }

    _handleGlobalMessage = ({ origin, source, data, ports } = {}) => {
        console.log('provider got global message', data, ports);
        if (data === INIT_BUS_CHANNEL_MESSAGE && ports) {
            console.log('setting up the channel', ports[0])
            this._setChannel(ports[0]);
            ports[0].onmessage = this._handleMessage;
        }
    }

    _handleMessage = ({ origin, source, data, ports } = {}) => {
        // TODO: Origin checking
        this._subscribers.forEach(({ callback, eventTypes }) => {
            if (eventTypes === ALL_EVENTS || eventTypes.includes(data.action)) {
                console.log('calling the callback', data);
                // callback(action, data);
            }
        });
    }

    _unsubscribe = subscription => {
        this._subscribers = this._subscribers
            .filter(subscriber => subscriber !== subscription);
    }

    subscribe = (callback, eventTypes = ALL_EVENTS) => {
        if (typeof callback !== 'function') {
            throw Error('MessageBusProvider.subscribe expects callback function as a first argument');
        }

        // TODO: Refactor data stucture, so that we don't have to iterate over each
        // subscription on every event
        const subscription = {
            eventTypes,
            callback,
        };

        this._subscribers.push(subscription);

        return () => this._unsubscribe(subscription);
    }
}
