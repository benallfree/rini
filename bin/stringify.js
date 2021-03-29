var fs = require('fs')
var data = fs.readFileSync(0, 'utf-8')
const code = `
export default ${JSON.stringify(data)};
`
console.log(code)
