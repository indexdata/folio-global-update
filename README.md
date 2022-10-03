# folio-global-update

This CLI will offer options for updating Folio objects en masse.

### Getting started

Requirements: 

* nodejs (https://nodejs.org/en/download/)
* yarn (https://yarnpkg.com/getting-started/install) or npm

Installing with yarn.

`$ yarn install`

Run the CLI

`$ node .`


### Configuration

When starting the CLI, you will be asked to choose a configuration file.

```
LIVE Not connected> config
? Choose configuration: (Use arrow keys)
❯ example.json 
  folio-testing-no-pass.json 
  folio-testing-no-user.json 
  folio-testing.json 
  indexdata-test.json 
  ──────────────
  Cancel 
```

The configuration files are located in the `configs` directory.  There is an example.config file included with this project.  Copy it to another fileanme and change it to your liking.  Here is an example configuration:

```
{
  "okapi": "http://localhost:9130",
  "tenant": "diku",
  "username": "diku_admin",
  "password": "admin",
  "inputPath": "data",
  "actionsPath": "actions",
  "logPath": "log",
  "errPath": "errors",
  "savePath": "saved",
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
- `errPath` -- log failed IDs here.  [ optional ]
- `savePath` -- save updated or created FOLIO objects to a file in this directory [ optional ]
- `testLimit` -- the number of IDs to process while in TEST mode. [ required when in TEST mode ]

NOTE: If you do not include a username or password, you will be prompted when running the `login` command.

### CLI functions

Type `help` to display all commands.

```
TEST Not connected> help

    help [command...]  Provides help for a given command.
    exit               Exits application.
    login              Log into FOLIO.
    logout             Destroy current auth token.
    live               Switch to LIVE mode
    test               Switch to TEST mode
    run                Run updates on FOLIO objects based on an action script and list of IDs.
    steps              Show built in action steps
    empty-cache        Clear out session cache
    settings           Show current config settings.
    config             Change configuration.

TEST Not connected> 
```

After a successful login, the prompt will display the mode (TEST or LIVE) and OKAPI host.  If not, the prompt will display `Not connected`.

When in TEST mode, no changes will be PUT or POSTed to the OKAPI endpoint.  Use this mode for testing the output of the selected action script.

Action scripts are JavaScript that make a change to a FOLIO object.  These files should be stored in the `actions` directory.  In their simplist form, an action will change a single, string field:

```
const action = async (id, steps) => {
  const url = `holdings-storage/holdings/${id}`;
  const record = await steps.goto(url);
  record.discoverySuppress = true;
  steps.preview(record);
  await steps.send(url, record);
  return;
}

module.exports = { action };
```
The above action script will suppress a holdings record.

Here is a current list of action steps:

```
        goto(url) -- sends a GET request to <url> and returns JSON data
        send(url, json) -- sends a PUT request to <url>, requires a <json> object. Returns JSON
        post(url, json) -- sends a POST request to <url>, requires a <json> object. Returns JSON
        delete(url) -- sends a DELETE request to <url>
        preview(updatedRecord, [ originalRecord ]) -- displays the difference between original and updated object
        uuidgen(data, [ namespace ]) -- returns a version 5 deterministic UUID based on <data>.  Takes an optional namespace
        putCache(key, value) -- stores key/value pairs for the session or until the empty-cache command is issued
        readCache(key) -- fetches value from cache based on key
```

To make this all happen, execute the `run` command which will subsequently prompt you to choose an action script:

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

Hitting enter will start the updating of records and log the progress to the screen (and the logPath, if set).
