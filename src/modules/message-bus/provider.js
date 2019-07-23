const DEFAULT_ORIGIN_SELECTOR = '*';
const ALL_EVENTS = Symbol('All events');

export default class MessageBusProvider {
    _window = null;
    _targetContext = null;
    _subscribers = [];

    constructor(window, targetContext) {
        if (!targetContext) {
            throw Error('Need to specify targetContext MessageBus will send messages to');
        }

        this._window = window;
        this._targetContext = targetContext;
        this._attachListener();
        // iframe.contentWindow.document.msgBus = 'abc';
    }

    _attachListener = () => {
        this._window.addEventListener('message', this._handleMessage);
    }

    _sendMessage = (action, payload) => {
        if (!this._ifram.contentWindow.postMessage) {
            return;
        }
        this._targetContext.contentWindow.postMessage({

        }, DEFAULT_ORIGIN_SELECTOR);
    }

    _handleMessage = ({ origin, source, data } = {}) => {
        console.log('abc', data);
        return;
        // if(source !== this._targetContext) {
        //     return;
        // }

        // TODO: Origin checking
        this._subscribers.forEach(({ callback, eventTypes }) => {
            if (eventTypes === ALL_EVENTS || eventTypes.includes(data.action)) {
                callback(action, data);
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
