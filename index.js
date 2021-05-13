const fs = require('fs');
const superagent = require('superagent');
const vorpal = require('vorpal')();
const inquirer = require('inquirer');
const readline = require('readline');
const diff = require('deep-diff')
const { Console } = require('console');
const path = require('path');
const chalk = vorpal.chalk;

const configsDir = './configs';
let config = {};
let token = null;
let host = null;
let originalRec = {};
let steps = {};
let logger = {};
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
  fileName: false,
  config: false,
}


const app = async () => {

  steps = {
    goto: getFolio,
    send: putFolio,
    post: postFolio,
    delete: deleteFolio,
    preview: preview,
  };


  vorpal
    .command('login', `Log into FOLIO.`)
    .action(async function (args, cb) {
      let self = this;
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
      token = await getAuthToken(config.okapi, config.tenant, user, pw, self);
      if (token) {
        work.status = host;
        setDelimiter();
      } else {
        token = null;
        setDelimiter('Not connected');
      }
      cb();
    });
  
  vorpal
    .command('logout', 'Destroy current auth token.')
    .action(function (args, cb) {
      token = null;
      work.status = 'Not connected';
      setDelimiter();
      cb();
    });

  vorpal
    .command('live', 'Switch to LIVE mode')
    .action(function (args, cb) {
      work.mode = 'LIVE';
      setDelimiter();
      cb();
    });

  vorpal
    .command('test', 'Switch to TEST mode')
    .action(function (args, cb) {
      work.mode = 'TEST';
      setDelimiter();
      cb();
    });

  vorpal.command('run', 'Run updates on FOLIO objects based on an action script and list of IDs.')
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
        },
        {
          type: 'confirm',
          name: 'continue',
          default: true,
          message: 'Run action?',
          when: function (answers) {
            return !(answers.fileName === 'Cancel' || answers.action === 'Cancel');
          }
        }
      ],
      async function (choice) {
        if (choice.action === 'Cancel' || choice.fileName === 'Cancel' || choice.continue === false) {
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
    })
    
  vorpal  
    .command('settings', `Show current config settings.`)
    .action(function (args, cb) {
      const configView = Object.assign({}, config);
      configView.password = '<hidden>';
      this.log(configView);
      cb();
    });
  
  vorpal
    .command('config', 'Change configuration.')
    .action(function (args, cb) {
      let self = this;
      return this.prompt({
          type: 'list',
          name: 'config',
          default: defaults.config,
          message: 'Choose configuration:',
          choices: function () {
            const sel = fs.readdirSync(configsDir);
            sel.push(new inquirer.Separator());
            sel.push('Cancel');
            return sel;
          }
      },
        async function(choice) {
          if (choice.config === 'Cancel') {
            if (!config.okapi) vorpal.exec('exit');
            cb();
          } else {
            config = require(`${configsDir}/${choice.config}`);
            host = config.okapi.replace(/^http.+?\/\//, '');
            token = '';
            work.status = 'Not connected';
            setDelimiter();
            cb();
          }
      });
    });

  vorpal.exec('config', function () {
  });
}

const runAction = async (self, scriptPath, inFile) => {

  steps.term = self;

  const script = require(scriptPath);
  if (script.prompt) {
    await inquirer.prompt({
      type: 'list',
      name: 'beverage',
      message: 'And your favorite beverage?',
      choices: ['Pepsi', 'Coke', '7up', 'Mountain Dew', 'Red Bull'],
    });
  }

  const readStream = fs.createReadStream(inFile);

  const rl = readline.createInterface({
    input: readStream,
    crlfDelay: Infinity
  });

  const pp = path.parse(scriptPath);
  if (config.logPath && work.mode !== 'TEST') {
    if (!fs.existsSync(config.logPath)) fs.mkdirSync(config.logPath);
    const lpath = `${config.logPath}/${pp.name}.log`;
    const logout = fs.createWriteStream(lpath);
    logger = new Console({ stdout: logout });
  } else {
    logger = { log: () => {} };
  }

  let failer = {};
  if (config.errPath && work.mode !== 'TEST') {
    if (!fs.existsSync(config.errPath)) fs.mkdirSync(config.errPath);
    const pp = path.parse(scriptPath);
    const spath = `${config.errPath}/${pp.name}.txt`;
    const sout = fs.createWriteStream(spath);
    failer = new Console({ stdout: sout });
  } else {
    failer = { log: () => {} };
  }

  const startTime = Date.now();
  const stats = {
    start: startTime,
    end: '',
    seconds: '',
    success: 0,
    failed: 0,
    total: 0,
  }

  let line = 0;
  for await (let id of rl) {
    id = id.replace(/^"|"$/g, '');
    line++;
    let logLine = `[${line}] Processing ${id}`;
    self.log(chalk.bold(logLine));
    logger.log(logLine);
    try {
      await script.action(id, steps);
      stats.success++;
    } catch (e) {
      self.log(chalk.red(e));
      let logLine = (e.message) ? e.message : e;
      logger.log(`  ERROR ${logLine}`);
      failer.log(id);
      stats.failed++;
    }
    if (work.mode === 'TEST' && line === config.testLimit) break;
  }
  delete require.cache[require.resolve(scriptPath)];
  stats.total = line;
  if (work.mode !== 'TEST') {
    const endTime = Date.now();
    stats.start = new Date(startTime).toUTCString();
    stats.end = new Date(endTime).toUTCString();
    stats.seconds = (endTime - startTime) / 1000;
    self.log(stats);
    logger.log(stats);
  }
}

const preview = async (updatedRec) => {
  try {
    if (work.mode === 'TEST') {
      let dout = diff(originalRec, updatedRec);
      steps.term.log(JSON.stringify(updatedRec, null, 2));
      let diffOut = { changes: [] };
      if (dout) {
        dout.forEach(d => {
          let prop = d.path.join('.');
          let df = {
            property: prop,
            old: d.lhs,
            new: d.rhs
          };
          diffOut.changes.push(df);
        })
      }
      diffOut.changeCount = diffOut.changes.length;
      steps.term.log(diffOut);
    }
  } catch (e) {
    vorpal.log(e);
  }
}

const getFolio = async (endpoint, noDiff) => {
  const url = `${config.okapi}/${endpoint}`;
  let logLine = `  GET ${url}`;
  steps.term.log(logLine);
  logger.log(logLine);
  try {
    let res = await superagent
      .get(url)
      .set('x-okapi-token', token)
      .set('accept', 'application/json')
    if (work.mode === 'TEST' && !noDiff) {
      bodyText = JSON.stringify(res.body);
      originalRec = JSON.parse(bodyText);
    }
    return res.body;
  } catch (e) {
    const errMsg = (e.response) ? e.response.text : e;
    throw new Error(errMsg);
  }
}

const putFolio = async (endpoint, payload) => {
  if (work.mode === 'LIVE') {
    const url = `${config.okapi}/${endpoint}`;
    let logLine = `  PUT ${url}`;
    steps.term.log(logLine);
    logger.log(logLine);
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
}

const postFolio = async (endpoint, payload) => {
  if (work.mode === 'LIVE') {
    const url = `${config.okapi}/${endpoint}`;
    let logLine = `  POST ${url}`;
    steps.term.log(logLine);
    logger.log(logLine);
    try {
      let res = await superagent
        .post(url)
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
}

const deleteFolio = async (endpoint) => {
  if (work.mode === 'LIVE') {
    const url = `${config.okapi}/${endpoint}`;
    let logLine = `  DELETE ${url}`;
    steps.term.log(logLine);
    logger.log(logLine);
    try {
      let res = await superagent
        .delete(url)
        .set('x-okapi-token', token)
        .set('accept', 'text/plain')
      return res.body;
    } catch (e) {
      const errMsg = (e.response) ? e.response.text : e;
      throw new Error(errMsg);
    }
  }
}

const getAuthToken = async (okapi, tenant, username, password, self) => {
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
    const errMsg = (e.response) ? e.response.text : e;
    self.log(chalk.red(errMsg));
  }
};

app();
