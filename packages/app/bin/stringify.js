var fs = require('fs')
var data = fs.readFileSync(0, 'utf-8')
const [node, script, varName] = process.argv
const code = `
export default ${JSON.stringify(data)};
`
console.log(code)
