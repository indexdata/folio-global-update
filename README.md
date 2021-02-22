# folio-global-update

This CLI will offer options for updating Folio objects en masse.

### Getting started

Requirements: 

* nodejs (https://nodejs.org/en/download/)
* yarn (https://yarnpkg.com/getting-started/install) or npm

Use you favorite package mananger (npm or yarn) to install required modules.

`$ yarn add`

Run the CLI

`$ node .`


### Configuration

The global update app will look for configuration settings in the config.json file and must be located in the project directory.

Here is an example config:

```
{
  "okapi": "http://localhost:9130",
  "tenant": "diku",
  "username": "diku_admin",
  "password": "admin",
  "inputPath": "data",
  "actionsPath": "actions",
  "logPath": "log",
  "savePath": "saved",
  "errPath": "errors",
  "testLimit": 5
}
```

- `okapi` -- OKAPI endpoint [ required ]
- `tenant` -- OKAPI tenant [ required ]
- `username` -- a FOLIO user with permissions to update records [ optional ]
- `password` -- the password for the above username [ optional ]
- `inputPath` -- where the CLI will find files of object IDs [ required ]
- `actionsPath` -- the location of update action files [ required ]
- `logPath` -- store logs in this directory [ optional ]
- `savePath` -- save original (unchanged) records here. This is useful for "rolling back" unwanted updates. [ optional ]
- `errPath` -- log failed records here.  [ optional ]
- `testLimit` -- the number of IDs to process while in TEST mode. [ required when in TEST mode ]

### CLI functions

Type `help` to display all commands.

```
Not connected> help

  Commands:

    help [command...]  Provides help for a given command.
    exit               Exits application.
    login              Log into FOLIO at https://localhost:9130
    mode               Choose between TEST or LIVE mode (default "LIVE")
    update             Update FOLIO objects based on an action script and list of IDs
    show <config>      Show okapi, tenant, or username settings.

Not connected> 
```

After a successful login, the prompt will display the mode and OKAPI host.  If not, the prompt will display `Not connected`.

When in TEST mode, no changes will be PUT to the OKAPI endpoint.  Use this mode for testing the output of the selected action script.

Action scripts are JavaScript that make a change to a FOLIO object.  In its simplist form, the action will change a single, string field:

```
metadata = {
  endpoint: 'holdings-storage/holdings'
};

const action = (record) => {
  record.discoverySuppress = true;
  return record;
}

module.exports = { metadata, action };
```

The above action script will suppress a holdings record.  The metadata object contains the required property `endpoint`.  The CLI will use this endpoint for getting a record to update.  Likewise it will put the changes to the same endpoint.

To make this all happen, run the `update` command which will subsequently prompt you to choose an action script:

```
LIVE folio-testing-okapi.dev.folio.org> update
? Choose action: (Use arrow keys)
❯ changeDueDate.js 
  suppressHoldings.js 
  suppressInstances.js 
  unsuppressHoldings.js 
```

Then it will prompt you for an ID file:

```
LIVE folio-testing-okapi.dev.folio.org> update
? Choose action: suppressHoldings.js
? Choose file: (Use arrow keys)
❯ holdingsIds.txt 
  instanceIds.txt 
  itemIds.txt 
```

Hitting enter will start the updating records and log the progress to the screen (and the logPath, if set).

