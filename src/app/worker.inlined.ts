
export default "(() => {\n  // src/app/worker.ts\n  var {log} = window;\n  window.onMessage((msg) => {\n    log(\"Rx main->worker\", {msg});\n  });\n  var exampleSocket = new WebSocket(\"ws://localhost:3000\");\n  log(\"got that socket\");\n  exampleSocket.onopen = (event) => {\n    log(\"onopen\");\n  };\n  exampleSocket.onerror = (e) => {\n    log(\"onerror\", e);\n  };\n  exampleSocket.onmessage = (m) => {\n    log(\"onmessage\", m);\n  };\n  exampleSocket.onclose = () => {\n    log(\"onclose\");\n  };\n  window.ready();\n})();\n";

