export default class MessageBusConsumer {
    _subscribers = [];
    _window = null;

    constructor(window) {
        console.log('Hello from consumer!');
        setTimeout(() => {
            console.log('bus', document.msgBus);
            window.top.postMessage({
                action: 'abc',
                payload: 'test',
            });
        }, 2000);
    }

    _attachListener = () => {
        this._window.addEventListener('message', this._handleMessage);
    }

    subscibe() {

    }

    request() {
        return Promise();
    }

}
