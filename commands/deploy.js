const async = require('async')
const {exec} = require('child_process')

module.exports = yargs => {
  const fns = Object.keys(require(process.cwd()))
  console.log('deploying:', fns)

  const deploy = (fn_name, next) => {
    exec(`npx functions deploy ${fn_name} --trigger-http`,
      (err, stdout, stderr) => {
        if (stderr) console.error(stderr)
        const result = err ? 'failure' : 'success'
        next(err, result)
      })
  }

  async.map(fns, deploy, (err, result) => {
    console.log({err, result})
  })
}
