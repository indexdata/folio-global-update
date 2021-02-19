const fs = require('fs');
const superagent = require('superagent');
const vorpal = require('vorpal')();
const readline = require('readline');
const config = require('./config.json');
let token = null;
const host = config.okapi.replace(/^http.+?\/\//, '');

const menus = {
  methods: [ 'Update', 'List', 'Delete' ],
  endpoints: config.endpoints
}

const app = async () => {
  vorpal
    .command('login', `Log into FOLIO at ${config.okapi}`)
    .action(async function (args, cb) {
      token = await getAuthToken(config.okapi, config.tenant, config.username, config.password);
      if (token.match(/Error/i)) {
        this.log(token);
      } else {
        this.log(`Login successfull!`);
      }
      cb();
    });

  vorpal.command('update')
    .action(function (args, cb) {
      const self = this;
      if (!token) {
        this.log('WARN You are not logged in!');
      }
      return this.prompt([
        {
          type: 'list',
          name: 'action',
          default: false,
          message: 'Choose action:',
          choices: function () {
            return fs.readdirSync(config.actionsPath);
          } 
        },
        {
          type: 'list',
          name: 'fileName',
          default: false,
          message: 'Choose file:',
          choices: function () {
            return fs.readdirSync(config.inputPath);
          }
        }
      ],
      async function (choice) {
        let scriptPath = `${config.actionsPath}/${choice.action}`;
        if (!scriptPath.match(/^(\.\/|\/)/)) scriptPath = `./${scriptPath}`;
        const inFile = `${config.inputPath}/${choice.fileName}`;
        getPutFolio(self, scriptPath, inFile)
        cb();
      });
    });

  
  vorpal  
    .command('show <config>', `Show okapi, tenant, or username settings.`)
    .action(function (args, cb) {
      this.log(config[args.config]);
      cb();
    });
  
  vorpal
    .delimiter(`${host}>`)
    .show();
}

const getPutFolio = async (self, scriptPath, inFile) => {
  
  const script = require(scriptPath);
  const endpoint = script.metadata.endpoint;

  const fileStream = fs.createReadStream(inFile);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  
  succ = 0;
  c = 0;
  for await (let id of rl) {
    let rec = {};
    c++;
    const url = `${config.okapi}/${endpoint}/${id}`;
    self.log(`[${c}] ${url}`);
    try {
      let res = await superagent
        .get(url)
        .set('x-okapi-token', token)
        .set('accept', 'application/json')
      rec = res.body;
      succ++;
    } catch (e) {
      if (e.response) {
        self.log(e.response.text);
        return;
      } else {
        self.log(e);
        return;
      }
    }
    if (rec.id) {
      updatedRec = script.action(rec);
      self.log(updatedRec);
    }
  };
  delete require.cache[require.resolve(scriptPath)];
  return succ;
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
  const path = '/bl-users/login'; 
  const authUrl = okapi + path;
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
