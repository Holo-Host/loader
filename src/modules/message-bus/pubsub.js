// Special default topic used for when subscriber wants to listen to all types
// of events
const ALL_TOPICS = Symbol('All topics')

export default class MessageBusPubSub {
  _subscribers = {
    [ALL_TOPICS]: []
  }

  _unsubscribe = (topic, callback) => {
    this._subscribers[topic] = this._subscribers[topic].filter(
      topicCallback => topicCallback !== callback
    )
  }

  subscribe = (callback, topic = ALL_TOPICS) => {
    if (typeof callback !== 'function') {
      throw Error(
        'MessageBusPubSub.subscribe expects callback function as a first argument'
      )
    }

    this._subscribers[topic] = [...this._subscribers[topic], callback]
    return () => this._unsubscribe(topic, callback)
  }

  publish = (topic, data) => {
    if (!topic) {
      throw Error(
        'MessageBusPubSub.publish expects specific topic to publish to'
      )
    }

    [
      ...this._subscribers[topic],
      ...this._subscribers[ALL_TOPICS]
    ].forEach((subscriber) => {
      subscriber(data)
    })
  }

  destroy = () => {
    this._subscribers = null
  }
}
