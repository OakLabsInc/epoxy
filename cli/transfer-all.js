//const _ = require('lodash')
const contentful = require('contentful')
const {promisify} = require('util')
const fs = require('fs')
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const {join} = require('path')
const Queue = require('promise-queue')

// helper to read files in currend directory
const rel = (...path) => join(process.cwd(), ...path)

// read/write resume token
const getResumeToken = async () => {
  return readFile(rel('.contentful-resume-token'))
}
const saveResumeToken = async (token) => {
  return writeFile(rel('.contentful-resume-token'), token)
}

module.exports = ({config, lawServices}) => {
  return {
    command: 'transfer-all',
    describe: 'initiate a transfer of all resources',
    builder: yargs => yargs
      .alias('l', 'limit'),
    handler: async yargs => {
      const client = contentful.createClient({
        accessToken: config.contentful.token,
        space: config.contentful.space_id,
        //environment: config.contentful.environment,
      })

      // check for resume token
      let token
      try {token = await getResumeToken()} catch (e) {}
      const args = token ? {nextSyncToken: token} : {initial: true}

      // sync project starting at resume token or null
      const response = await client.sync(args)

      // for each asset, send an epoxy event
      const sendEntry = async (data) =>
        lawServices.processContentful({data, action: 'publish'})

      // put all the records into one list
      const allRecords = response.entries.concat(response.assets)
      //const allRecords = response.entries.slice(3, 4)

      // queue them up to limit number of concurrent requests
      const bucketRequests = new Queue(5, 5000)
      allRecords.forEach(
        asset => bucketRequests.add(() => sendEntry(asset))
      )

      await bucketRequests

      // save the resume token
      //return saveResumeToken(response.nextSyncToken)
    }
  }
}
