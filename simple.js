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
          getPutFolio(self, scriptPath, inFile)
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

const getPutFolio = async (self, scriptPath, inFile) => {
  
  const script = require(scriptPath);
  const endpoint = script.metadata.endpoint;
  const postPoint = script.metadata.postEndpoint;

  const makeUrl = (endpoint, id) => {
    let ep = (endpoint.match(/\{id\}/)) ? endpoint.replace(/\{id\}/, id) : `${endpoint}/${id}`;
    let url = `${config.okapi}/${ep}`;
    return url;
  }

  const pp = path.parse(scriptPath);
  let logger = {};
  if (config.logPath && work.mode !== 'TEST') {
    if (!fs.existsSync(config.logPath)) fs.mkdirSync(config.logPath);
    const lpath = `${config.logPath}/${pp.name}.log`;
    const logout = fs.createWriteStream(lpath);
    logger = new Console({ stdout: logout });
  } else {
    logger = { log: () => {} };
  }

  let saver = {};
  if (config.savePath && work.mode !== 'TEST') {
    if (!fs.existsSync(config.savePath)) fs.mkdirSync(config.savePath);
    const pp = path.parse(scriptPath);
    const spath = `${config.savePath}/${pp.name}.jsonl`;
    const sout = fs.createWriteStream(spath);
    saver = new Console({ stdout: sout });
  } else {
    saver = { log: () => {} };
  }

  let failer = {};
  if (config.errPath && work.mode !== 'TEST') {
    if (!fs.existsSync(config.errPath)) fs.mkdirSync(config.errPath);
    const pp = path.parse(scriptPath);
    const spath = `${config.errPath}/${pp.name}.jsonl`;
    const sout = fs.createWriteStream(spath);
    failer = new Console({ stdout: sout });
  } else {
    failer = { log: () => {} };
  }

  const readStream = fs.createReadStream(inFile);

  const rl = readline.createInterface({
    input: readStream,
    crlfDelay: Infinity
  });

  const startTime = Date.now();
  
  let putUrl;
  const stats = {
    success: 0,
    fail: 0
  }
  let c = 0;
  for await (let id of rl) {
    let eMsg = null;
    let rec;
    let oldRecString;
    let oldRec;
    c++;
    if (endpoint) {
      let url = makeUrl(endpoint, id);
      let getMsg = `[${c}] GET ${url}`;
      self.log(getMsg);
      logger.log(getMsg)
      putUrl = url;
      try {
        let res = await superagent
          .get(url)
          .set('x-okapi-token', token)
          .set('accept', 'application/json')
        oldRecString = JSON.stringify(res.body); 
        oldRec = JSON.parse(oldRecString);
        rec = res.body;
      } catch (e) {
        eMsg = (e.response) ? e.response.text : e;
      }
    }

    if (rec || !endpoint) {
      if (work.mode !== 'TEST' && rec.id) saver.log(oldRecString);
      let updatedRec = {};
      try {
        updatedRec = await script.action(rec);
      } catch (e) {
        self.log(e);
      }
      if (work.mode === 'TEST') {
        let dout = diff(oldRec, updatedRec);
        self.log(updatedRec);
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
        self.log(diffOut);
        if (c === config.testLimit) break;
      } else {
        if (postPoint) {
          let url = makeUrl(postPoint, id);
          try {
            let pMsg = `[${c}] POST ${url}`; 
            self.log(pMsg);
            logger.log(pMsg);
            let res = await superagent
              .post(url)
              .send(updatedRec)
              .set('x-okapi-token', token)
              .set('accept', 'application/json')
              .set('accept', 'text/plain')
              .set('content-type', 'application/json')
            stats.success++
          } catch (e) {
            eMsg = (e.response) ? e.response.text : e;
            failer.log(JSON.stringify(updatedRec));
          }
        } else {
          try {
            let url = putUrl;
            let pMsg = `[${c}] PUT ${url}`;
            self.log(chalk.green(pMsg));
            logger.log(pMsg);
            let res = await superagent
              .put(url)
              .send(updatedRec)
              .set('x-okapi-token', token)
              .set('accept', 'application/json')
              .set('accept', 'text/plain')
              .set('content-type', 'application/json')
            stats.success++
          } catch (e) {
            eMsg = (e.response) ? e.response.text : e;
            failer.log(JSON.stringify(updatedRec));
          }
        }
      }
    }
    if (eMsg) {
      eMsg = `ERROR ${eMsg}`;
      self.log(chalk.red(eMsg));
      logger.log(eMsg);
      stats.fail++;
    }
  }
  if (!work.mode === 'TEST') {
    const endTime = Date.now();
    let seconds = (endTime - startTime) / 1000;
    stats.total = c;
    stats.start = new Date(startTime).toUTCString();
    stats.end = new Date(endTime).toUTCString();
    stats.seconds = seconds;
    self.log(stats);
    logger.log(stats);
  }
  delete require.cache[require.resolve(scriptPath)];
}

const getFolio = async (endpoint) => {
  const url = `${config.okapi}/${endpoint}`;
  try {
    let res = await superagent
      .get(url)
      .set('x-okapi-token', token)
      .set('accept', 'application/json')
    return res.body;
  } catch (e) {
    if (e.response) {
      return e.response.text;
    } else {
      return e;
    }
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
      return e.response.text;
    } else {
      return e;
    }
  }
};

app();
