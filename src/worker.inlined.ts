
export default "(() => {\n  // src/worker.ts\n  var {log} = window;\n  window.onMessage((e) => {\n    const msg = e.data;\n    window.log(\"Rx main->worker\", {msg});\n  });\n  var exampleSocket = new WebSocket(\"ws://localhost:3000\");\n  log(\"got that socket\");\n  exampleSocket.onopen = (event) => {\n    log(\"onopen\");\n  };\n  exampleSocket.onerror = (e) => {\n    log(\"got an error\", e);\n  };\n  exampleSocket.onmessage = (m) => {\n    log(\"got a message\", m);\n  };\n  window.ready();\n})();\n";

