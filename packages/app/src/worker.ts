import { Message } from './WebWorker'
const { log } = window

window.onMessage((e) => {
  const msg = e.data as Message
  window.log('Rx main->worker', { msg })
})

var exampleSocket = new WebSocket('ws://localhost:3000')
log('got that socket')

exampleSocket.onopen = (event) => {
  log("Here's some text that the server is urgently awaiting!")
  exampleSocket.send('foobarzas')
}

exampleSocket.onerror = (e) => {
  log('got an error')
}

exampleSocket.onmessage = (e) => {
  log('got a message')
}

window.ready()
