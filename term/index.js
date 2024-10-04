import inquirer from 'inquirer';
import superagent from 'superagent';
import fs from 'fs';

const confDir = '../configs';
let pageSize = 24;
const schemaDir = './schemas';

const mods = ['Users', 'Inventory'];
const userSettings = {
  'Permission sets': 'perms/permissions?query=mutable==true',
  'Patron groups': 'groups',
  'Address types': 'addresstypes'
}
const invSettings = {
  'Institutions': 'location-units/institutions',
  'Campuses': 'location-units/campuses',
  'Libraries': 'location-units/libraries',
  'Locations': 'locations'
}

let confs = fs.readdirSync(confDir);

const def = {};
let goBack = '<--';

let token = '';
let okapi;
let tenant;

function main() {
  clear();
  chooseConfig();
}

function clear() {
  console.log('\x1Bc');
}

function exit() {
  clear();
  console.log('See ya later...');
}

function errMsg(msg, func) {
  console.log(msg);
  inquirer
  .prompt([
    {type: 'confirm', name: 'yn', message: goBack, default: true},
  ])
  .then((a) => {
    if (a.yn) {
      func();
    } else {
      exit();
    }
  })
  .catch((e) => {
    let msg = e.message || e;
    console.log(msg);
  });  

}

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
    return { err: msg };
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
    .set('x-okapi-token', token)
    .set('accept', '*/*')
    .set('content-type', 'application/json');
    return res[rtype];
  } catch(e) {
    let msg = (e.response) ? e.response.text : e;
    errMsg(msg);
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
    return res.body;
  } catch(e) {
    let msg = (e.response) ? e.response.text : e;
    return { err: msg };
  }
}

async function del(ep) {
  ep = ep.replace(/^\//, '');
  let url = okapi + '/' + ep;
  console.log(`DELETE ${url}`);
  try {
    let res = await superagent
    .delete(url)
    .set('x-okapi-token', token)
    .set('accept', 'text/plain')
    return res;
  } catch(e) {
    let msg = (e.response) ? e.response.text : e;
    errMsg(msg);
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

function edit(text, ep, back) {
  clear();
  inquirer
  .prompt([
    {type: 'editor', name: 'newText', message: 'Edit this', default: text},
    {type: 'confirm', name: 'save', message: 'Save changes', default: true},
  ])
  .then((a) => {
    if (a.save) {
     put(ep, a.newText);
    }
    viewCrud(ep, back);
  })
  .catch((e) => {
    let msg = e.message || e;
    console.log(msg);
  });  
}

function delConfirm(ep, back) {
  inquirer
  .prompt([
    {type: 'confirm', name: 'act', message: `Delete this record`, default: false},
  ])
  .then(async (a) => {
    if (a.act) {
      let res = await del(ep, back);
    } else {
      settings();
    }
  })
  .catch((e) => {
    let msg = e.message || e;
    console.log(msg);
  }); 
}

function newCrud(ep, func) {
  let sfile = schemaDir + '/' + ep + '.json';
  try {
    let prs = [];
    let schema = fs.readFileSync(sfile, { encoding: 'utf8'});
    let s = JSON.parse(schema);
    for (let p in s.properties) {
      if (p !== 'id' && s.properties[p].type === 'string') {
        prs.push({ type: 'input', name: p, message: p});
      }
    }
    inquirer
    .prompt(prs)
    .then(async (a) => {
      console.log(a);
      await post(ep, a);
      func();
    })
    .catch((e) => {
      let msg = e.message || e;
      console.log(msg);
    }); 

    } catch(e) {
      errMsg(e, settings);
    }
}

async function viewCrud(ep, back, func) {
  clear();
  console.log(back);
  let rec = await get(ep);
  let recStr = JSON.stringify(rec, null, 2);
  console.log(recStr);

  let ch = [new inquirer.Separator(), 'Edit', 'Delete', goBack];
  inquirer
  .prompt([
    {type: 'list', name: 'act', message: 'Choose one', choices: ch, pageSize: pageSize},
  ])
  .then((a) => {
    if (a.act === goBack) {
      listCrud(back, func);
    } else if (a.act === 'Delete') {
      delConfirm(ep, back);
    } else {
      edit(recStr, ep, back);
    }
  })
  .catch((e) => {
    let msg = e.message || e;
    console.log(msg);
  }); 

}

async function listCrud(ep, func) {
  clear();
  let brief = [];
  let propName = '';
  let link = ep.replace(/^(.+)\?.*/, '$1');
  let url = (ep.match(/\?/)) ? ep + '&limit=1000' : ep + '?limit=1000';
  const res = await get(url);
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
  brief.sort((a, b) => { 
    if (a.name > b.name) {
      return 1;
    } else {
      return -1;
    }
  });
  brief.push(new inquirer.Separator(), 'New', goBack);
  inquirer
  .prompt([
    {type: 'list', name: 'ep', message: `Settings ${propName}`, choices: brief, pageSize: pageSize},
  ])
  .then((a) => {
    if (a.ep === goBack) {
      func();
    } else if (a.ep === 'New') {
      newCrud(ep, func);
    } else {
      viewCrud(a.ep, ep, func);
    }
  })
  .catch((e) => {
    let msg = e.message || e;
    console.log(msg);
  }); 
}

function invSet() {
  clear();
  let menu = [];
  for (let k in invSettings) {
    menu.push(k);
  }
  menu.push(new inquirer.Separator());
  menu.push(goBack);
  inquirer
  .prompt([
    {type: 'list', name: 'set', message: 'Inventory settings', choices: menu, pageSize: pageSize},
  ])
  .then(async (a) => {
    if (a.set === goBack) {
      settings();
    } else {
      let ep = invSettings[a.set];
      listCrud(ep, invSet);
    }
  })
  .catch((e) => {
    let msg = e.message || e;
    console.log(msg);
  }); 
}


function userSet() {
  clear();
  let menu = [];
  for (let k in userSettings) {
    menu.push(k);
  }
  menu.push(new inquirer.Separator());
  menu.push(goBack);
  inquirer
  .prompt([
    {type: 'list', name: 'set', message: 'User settings', choices: menu, pageSize: pageSize},
  ])
  .then(async (a) => {
    if (a.set === goBack) {
      settings();
    } else {
      let ep = userSettings[a.set];
      listCrud(ep, userSet);
    }
  })
  .catch((e) => {
    let msg = e.message || e;
    console.log(msg);
  }); 
}

function settings() {
  clear();
  let allMods = [...mods, goBack];
  inquirer
  .prompt([
    {type: 'list', name: 'mod', message: 'Settings', choices: allMods, pageSize: pageSize},
  ])
  .then((a) => {
    if (a.mod === goBack) {
      chooseMods();
    } else {
      if (a.mod === 'Users') {
        userSet();
      } else if (a.mod === 'Inventory') {
        invSet();
      }
    }
  })
  .catch((e) => {
    let msg = e.message || e;
    console.log(msg);
  }); 
}

function chooseMods() {
  clear();
  let allMods = [...mods, 'Settings', goBack];
  inquirer
  .prompt([
    {type: 'list', name: 'mod', message: 'Choose a module', choices: allMods, pageSize: pageSize},
  ])
  .then((a) => {
    if (a.mod === goBack) {
      chooseConfig();
    } else if (a.mod === 'Settings') {
      settings();
    } else {
      throw Error(`${a.mod} not setup!`);
    }
  })
  .catch((e) => {
    let msg = e.message || e;
    errMsg(msg, chooseMods);
  });
}

function chooseConfig() {
  clear();
  let menu = [...confs, 'Exit'];
  inquirer
    .prompt([
      {type: 'list', name: 'config', message: 'Choose a config', choices: menu, pageSize: pageSize, default: def.chooseConfig},
    ])
    .then((answers) => {
      if (answers.config === 'Exit') {
        exit();
      } else {
        const cf = confDir + '/' + answers.config;
        const cs = fs.readFileSync(cf, {encoding: 'utf8'});
        const conf = JSON.parse(cs);
        def.chooseConfig = answers.config;
        login(conf);
      }
    })
    .catch((e) => {
      let msg = e.message || e;
      console.log(msg);
    });
}

main();