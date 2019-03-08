const {spawn} = require('child_process')

module.exports = yargs => {
  const argv = yargs
    .usage('usage: $0 log [options]')
    .alias('l', 'limit')
    .number('l')
    .default('l', 50)
    .argv

  console.log(`npx functions logs read --limit=${argv.l}`)
  //exec(`functions logs read --limit=${argv.l}`)
  spawn('npx', ['functions', 'logs', 'read', `--limit=${argv.l}`], {stdio: 'inherit'})
}
