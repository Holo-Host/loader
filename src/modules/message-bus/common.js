import { MESSAGE_BUS_VERSION } from './const'

export const createMessage = (message) => ({
  MESSAGE_BUS_VERSION,
  message
})
