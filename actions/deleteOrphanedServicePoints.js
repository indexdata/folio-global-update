/*
 Takes a file of service point users and checks the userId against users, if there is no match, delete
 the service point user.
*/

const action = async (line, steps) => {
  let spu = JSON.parse(line);
  let uid = spu.userId;
  let url = 'users?query=id==' + uid;
  const res = await steps.goto(url);
  if (res.totalRecords === 0) {
	  let spid = spu.id;
	  let durl = 'service-points-users/' + spid;
	  steps.delete(durl);
  }
  return;
}

module.exports = { action };
