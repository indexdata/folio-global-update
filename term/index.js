import inquirer from 'inquirer';
import superagent from 'superagent';
import fs from 'fs';

const confDir = '../configs';
let pageSize = 24;

const mods = ['Users', 'Inventory'];
const userSettings = {
  'Permission sets': 'perm/permissions?query=mutable==true',
  'Patron groups': 'groups',
  'Address types': 'address-types'
}

let confs = fs.readdirSync(confDir);

let token;
let okapi;
let tenant;

function main() {
  chooseConfig();
}

function exit() {
  console.log('See ya later...');
};

async function post(ep, payload, rtype) {
  if (!rtype) rtype = 'body';
  ep = ep.replace(/^\//, '');
  let url = okapi + '/' + ep;
  console.log(`POST ${url}`);
  try {
    let res = await superagent
    .post(url)
    .send(payload)
    .set('x-okapi-tenant', tenant)
    .set('accept', '*/*')
    .set('content-type', 'application/json');
    return res[rtype];
  } catch(e) {
    let msg = (e.response) ? e.response.text : e;
    return { err: e };
  }
}

async function login(conf) {
  okapi = conf.okapi;
  tenant = conf.tenant;
  console.log(`Logging into ${okapi}...`);
  let ep = conf.authPath || 'authn/login';
  const pl = {
    username: conf.username,
    password: conf.password
  };
  let res = await post(ep, pl, 'headers');
  if (res.err) {
    console.log(res.err);
  } else {
    if (res['x-okapi-token']) {
      token = res['x-okapi-token'];
    } else {
      let cooks = res['set-cookie'];
      for (let x = 0; x < cooks.length; x++) {
        let c = cooks[x];
        if (c.match(/^folioRefreshToken/)) {
          token = c.replace(/^folioRefreshToken=([^;]+).*/, '$1');
        }
      }
    }
    console.log('Login successful!');
    chooseMods();
  }
}

function userSet() {
  let menu = [];
  for (let k in userSettings) {
    menu.push(k);
  }
  menu.push('Cancel');
  inquirer
  .prompt([
    {type: 'list', name: 'set', message: 'User settings', choices: menu, pageSize: pageSize},
  ])
  .then((a) => {
    if (a.mod === 'Cancel') {
      settings();
    } else {
      let ep;
      if (a.set === 'Permission sets') {
        ep = userSettings[a.set];
        console.log(ep);
      }
    }
  })
  .catch((e) => {
    let msg = e.message || e;
    console.log(msg);
  }); 

}

function settings() {
  let allMods = [...mods, 'Cancel'];
  inquirer
  .prompt([
    {type: 'list', name: 'mod', message: 'Settings', choices: allMods, pageSize: pageSize},
  ])
  .then((a) => {
    if (a.mod === 'Cancel') {
      chooseMods();
    } else {
      if (a.mod === 'Users') {
        userSet(a.mod);
      }
    }
  })
  .catch((e) => {
    let msg = e.message || e;
    console.log(msg);
  }); 
}

function chooseMods() {
  let allMods = [...mods, 'Settings', 'Exit'];
  inquirer
  .prompt([
    {type: 'list', name: 'mod', message: 'Choose a module', choices: allMods, pageSize: pageSize},
  ])
  .then((a) => {
    if (a.mod === 'Exit') {
      exit();
    } else if (a.mod === 'Settings') {
        settings();
    }
  })
  .catch((e) => {
    let msg = e.message || e;
    console.log(msg);
  });
}

function chooseConfig() {
  let menu = [...confs, 'Exit'];
  inquirer
    .prompt([
      {type: 'list', name: 'config', message: 'Choose a config', choices: menu, pageSize: pageSize},
    ])
    .then((answers) => {
      if (answers.config === 'Exit') {
        exit();
      } else {
        const cf = confDir + '/' + answers.config;
        const cs = fs.readFileSync(cf, {encoding: 'utf8'});
        const conf = JSON.parse(cs);
        login(conf);
      }
    })
    .catch((e) => {
      let msg = e.message || e;
      console.log(msg);
    });
}

main();
