import inquirer from 'inquirer';
import superagent from 'superagent';
import fs from 'fs';

const confDir = '../configs';
let pageSize = 24;

const mods = ['Users', 'Inventory'];
const userSettings = {
  'Permission sets': 'perms/permissions?query=mutable==true',
  'Patron groups': 'groups',
  'Address types': 'addresstypes'
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

async function put(ep, payload) {
  ep = ep.replace(/^\//, '');
  let url = okapi + '/' + ep;
  console.log(`PUT ${url}`);
  try {
    let res = await superagent
    .put(url)
    .send(payload)
    .set('x-okapi-token', token)
    .set('accept', '*/*')
    .set('content-type', 'application/json');
    return res;
  } catch(e) {
    let msg = (e.response) ? e.response.text : e;
    return { err: e };
  }
}

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

async function get(ep) {
  ep = ep.replace(/^\//, '');
  let url = okapi + '/' + ep;
  console.log(`GET ${url}`);
  try {
    let res = await superagent
    .get(url)
    .set ('x-okapi-token', token)
    .set('accept', '*/*')
    .set('content-type', 'application/json');
    return res.body;
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
        if (c.match(/^folioAccessToken/)) {
          token = c.replace(/^folioAccessToken=([^;]+).*/, '$1');
        }
      }
    }
    console.log('Login successful!');
    chooseMods();
  }
}

function edit(text, ep) {
  inquirer
  .prompt([
    {type: 'editor', name: 'newText', message: 'Edit this', default: text},
    {type: 'confirm', name: 'save', message: 'Save changes', default: true},
  ])
  .then((a) => {
    if (a.save) {
     put(ep, a.newText);
    }
  })
  .catch((e) => {
    let msg = e.message || e;
    console.log(msg);
  });  
}

async function viewCrud(ep) {
  let rec = await get(ep);
  let recStr = JSON.stringify(rec, null, 2);
  console.log(recStr);

  let ch = [new inquirer.Separator(), 'Edit', '<--'];
  inquirer
  .prompt([
    {type: 'list', name: 'act', message: 'Choose one', choices: ch, pageSize: pageSize},
  ])
  .then((a) => {
    if (a.act === '<--') {
      settings();
    } else {
      edit(recStr, ep);
    }
  })
  .catch((e) => {
    let msg = e.message || e;
    console.log(msg);
  }); 

}

async function listCrud(ep) {
  let brief = [];
  let propName = '';
  let link = ep.replace(/^(.+)\?.*/, '$1');
  const res = await get(ep);
  for (let prop in res) {
    let p = res[prop];
    if (Array.isArray(p)) {
      for (let x = 0; x < p.length; x++) {
        let r = p[x];
        let l = r.name || r.code || r.group || r.displayName || r.permissionName || r.addressType;
        let h = {
          name: l,
          value: link + '/' + r.id
        }
        brief.push(h);
      }
      propName = prop;
      break;
    }
  }
  brief.push(new inquirer.Separator(), '<--');
  inquirer
  .prompt([
    {type: 'list', name: 'ep', message: `Settings ${propName}`, choices: brief, pageSize: pageSize},
  ])
  .then((a) => {
    if (a.ep === '<--') {
      settings();
    } else {
      viewCrud(a.ep);
    }
  })
  .catch((e) => {
    let msg = e.message || e;
    console.log(msg);
  }); 
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
  .then(async (a) => {
    if (a.mod === 'Cancel') {
      settings();
    } else {
      let ep = userSettings[a.set];
      listCrud(ep);
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
