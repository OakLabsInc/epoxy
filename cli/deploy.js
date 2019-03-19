  /* eslint-disable no-unused-expressions */
const async = require('async')
const {exec} = require('child_process')

const deployEnvironments = {
  gcs: ({prefix, envFile}) =>
    fn_name => `gcloud functions deploy ${prefix}${fn_name} --entry-point ${fn_name} --runtime nodejs8 --trigger-http --env-vars-file=${envFile}`,
  local: ({prefix, envFile}) =>
    fn_name => `npx functions deploy ${fn_name} --trigger-http`,
}
function getDeployCommand(argv) {
  const {environment} = argv
  const cmd = deployEnvironments[environment]
  if (!cmd) throw new Error(`invalid environment: ${environment}`)
  return cmd(argv)
}

module.exports = services => yargs => {
  const argv = yargs
    .usage('usage: $0 <environment>')
    .option('e', {
      alias: 'environment',
      default: 'local',
      choices: ['local', 'gcs'],
      describe: 'deploy to local emulator or google cloud services',
    })
    .option('p', {
      alias: 'prefix',
      type: 'string',
      describe: 'prefix for the function name - can be used for dev/stage/production',
    })
    .option('f', {
      alias: 'envFile',
      describe: 'file containing environment settings to be applied to the cloud functions',
      type: 'string',
    })
    .argv

  const serviceNames = Object.keys(services)
  const cmdBuilder = getDeployCommand(argv)
  console.log('deploying:', serviceNames)

  const deploy = (fn_name, next) => {
    const cmd = cmdBuilder(fn_name)
    console.log(cmd)
    exec(cmd,
      (err, stdout, stderr) => {
        if (stderr) console.error(stderr)
        const result = err ? 'failure' : 'success'
        next(err, result)
      })
  }

  // this takes a long time... might as well do it in parallel
  async.map(serviceNames, deploy, (err, result) => {
    if (err) console.error(err)
    else console.log(result)
  })
}
