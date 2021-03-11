const fs = require('fs');
const superagent = require('superagent');
const vorpal = require('vorpal')();
const inquirer = require('inquirer');
const readline = require('readline');
const chalk = require('chalk');
const diff = require('deep-diff')
const { Console } = require('console');
const path = require('path');
const config = require('./config.json');

let token = null;
const host = config.okapi.replace(/^http.+?\/\//, '');
let work = {
  mode: 'TEST',
  status: 'Not connected'
}
const setDelimiter = () => {
  vorpal.delimiter(`${work.mode} ${work.status}>`).show();

}
setDelimiter();
const defaults = {
  action: false,
  fileName: false
}

const app = async () => {
  vorpal
    .command('login', `Log into FOLIO at ${config.okapi}`)
    .action(async function (args, cb) {
      let user;
      let pw;
      if (!config.username) {
        await this.prompt(
          {
            type: 'input',
            name: 'user',
            message: 'Username: '
          }, function (input) {
            user = input.user;
          }
        )
      } else {
        user = config.username;
      }
      if (!config.password) {
        await this.prompt(
          {
            type: 'password',
            name: 'pass',
            message: 'Password: '
          }, function (input) {
            pw = input.pass;
          }
        )
      } else {
        pw = config.password;
      }
      token = await getAuthToken(config.okapi, config.tenant, user, pw);
      if (token.match(/Error/i)) {
        this.log(token);
      } else {
        work.status = host;
        setDelimiter();
      }
      cb();
    });
  
  vorpal
    .command('logout', 'Destroy current auth token.')
    .action(function (args, cb) {
      token = '';
      work.status = 'Not connected';
      setDelimiter();
      cb();
    });

  vorpal
    .command('mode', 'Choose between TEST or LIVE modes.')
    .action(function (args, cb) {
      return this.prompt(
        {
          type: 'list',
          name: 'mode',
          default: work.mode,
          message: 'Choose mode:',
          choices: [ 'LIVE', 'TEST' ]
        },
        async function (choice) {
          work.mode = choice.mode;
          setDelimiter();
          cb();
        });
    });

  vorpal.command('update', 'Update FOLIO objects based on an action script and list of IDs')
    .action(function (args, cb) {
      const self = this;
      if (!token) {
        this.log(chalk.yellow('WARN You are not logged in!'));
      }
      return this.prompt([
        {
          type: 'list',
          name: 'action',
          default: defaults.action,
          message: 'Choose action:',
          choices: function () {
            const sel = fs.readdirSync(config.actionsPath);
            sel.push(new inquirer.Separator());
            sel.push('Cancel');
            return sel;
          }
        },
        {
          type: 'list',
          name: 'fileName',
          default: defaults.fileName,
          message: 'Choose file:',
          choices: function () {
            let sel = fs.readdirSync(config.inputPath);
            sel.push(new inquirer.Separator());
            sel.push('Cancel');
            return sel;
          },
          when: function (answers) {
            return answers.action !== 'Cancel';
          }
        }
      ],
      async function (choice) {
        if (choice.action === 'Cancel' || choice.fileName === 'Cancel') {
          cb();
        } else {
          defaults.action = choice.action;
          defaults.fileName = choice.fileName;
          let scriptPath = `${config.actionsPath}/${choice.action}`;
          if (!scriptPath.match(/^(\.\/|\/)/)) scriptPath = `./${scriptPath}`;
          const inFile = `${config.inputPath}/${choice.fileName}`;
          runAction(self, scriptPath, inFile)
          cb();
        }
      });
    });

  
  vorpal  
    .command('settings', `Show app settings.`)
    .action(function (args, cb) {
      const configView = Object.assign({}, config);
      configView.password = '<hidden>';
      this.log(configView);
      cb();
    });
}

const runAction = async (self, scriptPath, inFile) => {

  const steps = {
    goto: getFolio,
    send: putFolio,
    term: self
  };

  const script = require(scriptPath);

  const readStream = fs.createReadStream(inFile);

  const rl = readline.createInterface({
    input: readStream,
    crlfDelay: Infinity
  });

  let line = 0;
  for await (let id of rl) {
    line++;
    self.log(chalk.bold(`[${line}] Processing ${id}`));
    try {
      await script.action(id, steps);
    } catch (e) {
      self.log(chalk.red(e));
    }
  }
  
  delete require.cache[require.resolve(scriptPath)];
}

const getFolio = async (endpoint) => {
  const url = `${config.okapi}/${endpoint}`;
  vorpal.log(`  GET ${url}`);
  try {
    let res = await superagent
      .get(url)
      .set('x-okapi-token', token)
      .set('accept', 'application/json')
    return res.body;
  } catch (e) {
    const errMsg = (e.response) ? e.response.text : e;
    throw new Error(errMsg);
  }
}

const putFolio = async (endpoint, payload) => {
  const url = `${config.okapi}/${endpoint}`;
  vorpal.log(`  PUT ${url}`);
  try {
    let res = await superagent
      .put(url)
      .send(payload)
      .set('x-okapi-token', token)
      .set('accept', 'application/json')
      .set('accept', 'text/plain')
      .set('content-type', 'application/json')
    return res.body;
  } catch (e) {
    const errMsg = (e.response) ? e.response.text : e;
    throw new Error(errMsg);
  }
}

const getAuthToken = async (okapi, tenant, username, password) => {
  const authUrl = okapi + '/bl-users/login'; 
  const authBody = `{"username": "${username}", "password": "${password}"}`;
  try {
    let res = await superagent
      .post(authUrl)
      .send(authBody)
      .set('x-okapi-tenant', tenant)
      .set('accept', 'application/json')
      .set('content-type', 'application/json');
    return res.headers['x-okapi-token'];
  } catch (e) {
    if (e.response) {
      e.response.text;
    } else {
      return e;
    }
  }
};

app();
