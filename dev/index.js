import MessageBusConsumer from '../src/modules/message-bus/consumer'

const testCallback = (action, data) => console.log('consumer got message', action, data)

const bus = new MessageBusConsumer(window)
// const subscription = bus.subscribe(testCallback);

/*
// Way 1
const subscription = bus.subscribe(testCallback);
// subscription.unsub();

// Way 2
bus.request()
    .then(() => {})
    .catch(() => {})
*/
