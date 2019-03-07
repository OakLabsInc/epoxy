# Epoxy

Epoxy is a tool to glue cloud services together.  Conceptually it's similar to Zapier.

Currently the only supported use case is to sync a Contentful environment with a Google Cloud Storage bucket.  Other use cases may be implemented as the need arises.

# Usage

In typical usage, you would create an index.js file that will require `epoxy` and pass it the configuration it requires.

```javascript
const {join} = require('path')

// load environment variables
require('dotenv').config()
const {
  SERVICE_URL,
  CONTENTFUL_SPACE_ID,
  CONTENTFUL_ENVIRONMENT,
  CONTENTFUL_TOKEN,
  GCLOUD_PROJECT,
  GCLOUD_BUCKET,
  GCLOUD_PATH_PREFIX,
} = process.env

const resource_config = require('../config/resources.json')

// initialize epoxy
const epoxy = require('epoxy')
const services = epoxy({
  contentful: {
    space_id: CONTENTFUL_SPACE_ID,
    environment: CONTENTFUL_ENVIRONMENT,
    token: CONTENTFUL_TOKEN,
  },
  gcloud: {
    project: GCLOUD_PROJECT,
    bucket: GCLOUD_BUCKET,
    path_prefix: GCLOUD_PATH_PREFIX,
    auth_file: join(__dirname, '../config/gcloud-auth.json'),
  },
  service_url: SERVICE_URL,
  resource_config,
})

// services must be returned as exports in order for google cloud
// functions to process and upload
module.exports = services
```

To obtain a gcloud-auth.json, follow the directions for [setting up a google service account](https://cloud.google.com/iam/docs/creating-managing-service-account-keys), and make sure that service account has write access to the bucket you intend to deploy to.

Your resource config will depend on the contentful resources that you want to sync up.  It will look something like this:

```javascript
{
  "resources": {
    "category": {
      "params": {
        "path": "category",
        "fileNameKey": [ "id" ]
      },
      "actions": {
        "publish": [
          {
            "$service": "writeEntry"
          }
        ],
        "unpublish": [
          {
            "$service": "deleteEntry"
          }
        ]
      }
    },
    "topics": {
      "params": {
        "path": "topic",
        "fileNameKey": [
          "category",
          "id"
        ]
      },
      "actions": {
        "publish": [
          {
            "$service": "writeEntry"
          }
        ],
        "unpublish": [
          {
            "$service": "deleteEntry"
          }
        ]
      }
    }
  }
}
```

## Key Terms:

* resource: is the Content Model you wish to sync
* params: is a set of params that will be sent to any services triggered by this resource
* action list: is either publish or unpublish, and contains a list of actions to be triggered
* action item: either $service or $resource.  $service triggers some kind of processing of the data that was received.  $resource forwards the data to another resource, which must be defined elsewhere in this file.


## Standard Services

These are the standard services that are supplied.  Think of them as the possible "outputs" of your pipeline.

### deleteEntry
* requires: path, fileNameKey
### writeEntry
* requires: path, fileNameKey
### writeFile
* requires: path, fileNameKey

## Service Params

Simple params:

```javascript
"params": {
  "path": "category",
  "fileNameKey": [ "id" ]
},
```

This will pull `id` out of the data coming in from contentful and use that as the filename.

`fileNameKey` supports some more complex use cases as well:

```javascript
"params": {
  "path": "topics",
  "fileNameKey": [
    "id",
    {
      "md5": [ "content" ]
    }
  ]
},
```

This will take the `id` from the data, run an md5 function on the content, and join the result with an underscore.  The result might look like `topics/5_a94e2`.

## Custom Services

In addition you can define your own services and pass them to epoxy at the time of initialization.

```javascript
const services = epoxy({
  ...other config,
  custom_services: require('./custom')
})
```

`custom_services` should be an object where the keys are service names, and the values are in the format of a standard [law service](https://github.com/torchlightsoftware/law).

Custom services let you perform any action you want - save to a database, send a request to a cloud service, etc.  Any javascript code you want to write can be run and passed the params of the event.  If you build some general purpose services that you think others might find handy, let us know!  We'd love to expand our library of features.
