const {promisify} = require('util')
const exec = promisify(require('child_process').exec)

const binaries = [
  {bin: 'functions', dep: '@google-cloud/functions-emulator'},
  {bin: 'serverless', dep: 'serverless'},
]

module.exports = async () => {
  let services
  services = require(process.cwd())
  if (!services || !services.isEpoxyService) {
    console.error('Not in an epoxy services directory.  Did you export your epoxy services from your main project file?')
    process.exit()
  }

  // see if the binary is installed, if not install the corresponding dependency
  for (let b of binaries) {
    const {bin, dep} = b
    try {
      await exec(`npx which ${bin}`)
    } catch (e) {
      if (e) {
        console.log(`Could not find binary '${bin}', installing '${dep}' to devDependencies.`)
        await exec(`npm i -D ${dep}`)
      } else {
        throw e
      }
    }
  }

  return services
}
