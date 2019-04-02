module.exports = ({lawServices}) => {
  return {
    command: 'run <service>',
    builder: yargs => yargs
      .strict(false)
      .help()
      .positional('service', {
        describe: 'name of the service to run',
        type: 'string',
        required: true,
      }),
    handler: async argv => {
      const [, service_name] = argv._
      const result = await lawServices[service_name](argv)
      console.dir(result, {depth: 5})
    }
  }
}
