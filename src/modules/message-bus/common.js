import { MESSAGE_BUS_VERSION } from './const'

export const createMessage = (message) => ({
  MESSAGE_BUS_VERSION,
  message
})

export const requiredField = (error) => {
  throw Error(error)
}
