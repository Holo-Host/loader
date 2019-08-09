/*
  This is an example consumer implementation (for example in hClient)
*/

import MessageBusConsumer from '../src/modules/message-bus/consumer'
import { REQEUST_ACTION_SUFFIX, REQEUST_SUCCESS_ACTION_SUFFIX } from '../src/modules/message-bus/const'

const bus = new MessageBusConsumer(window)

const testCallback = (action, data) => {
  console.log('client got message', action, data)

  // Simulate successful request response
  bus.sendMessage(
    'GET_APP_ID' + REQEUST_SUCCESS_ACTION_SUFFIX,
    {
      actionProviderRequestId: data.actionProviderRequestId,
      actionPayload: 'this-is-my-app-id'
    }
  )
}

bus.subscribe(testCallback, 'GET_APP_ID' + REQEUST_ACTION_SUFFIX)

bus.makeRequest('GET_HOSTS', 'QmWzAyDWAeYYQVPAK87qPQryBLhje26dWvaYDMWcLgkwfe').then(
  (data) => console.log('successfully got hosts from loader', data),
  (data) => console.log('couldnt get hosts from loader', data)
)
