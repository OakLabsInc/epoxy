  /* eslint-disable no-unused-expressions */
const async = require('async')
const {exec} = require('child_process')

module.exports = services => yargs => {
  yargs
    .usage('usage: $0 <environment>')
    .argv

  const serviceNames = Object.keys(services)
  console.log('deploying:', serviceNames)

  const deploy = (fn_name, next) => {
    exec(`npx functions deploy ${fn_name} --trigger-http`,
      (err, stdout, stderr) => {
        if (stderr) console.error(stderr)
        const result = err ? 'failure' : 'success'
        next(err, result)
      })
  }

  async.map(serviceNames, deploy, (err, result) => {
    console.log({err, result})
  })
}
