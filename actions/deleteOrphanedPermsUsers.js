/*
 Takes a file of perms users and checks the userId against users, if there is no match, delete
 the perms/user recod.
*/

const action = async (line, steps) => {
  let pu = JSON.parse(line);
  let uid = pu.userId;
  let url = 'users?query=id==' + uid;
  const res = await steps.goto(url);
  if (res.totalRecords === 0) {
	  let durl = 'perms/users/' + pu.id;
	  steps.delete(durl);
  }
  return;
}

module.exports = { action };
