/// <reference lib="dom"/>

const { log } = window

window.onMessage((msg) => {
  log('Rx main->worker', { msg })
})

var exampleSocket = new WebSocket('ws://localhost:3000')
log('got that socket')

exampleSocket.onopen = (event) => {
  log('onopen')
}

exampleSocket.onerror = (e) => {
  log('onerror', e)
}

exampleSocket.onmessage = (m) => {
  log('onmessage', m)
}

exampleSocket.onclose = () => {
  log('onclose')
}

window.ready()
