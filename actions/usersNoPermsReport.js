/*
 Takes a file of service point users and checks the userId against users and reports  back on not found users.
*/

const action = async (line, steps) => {
  let rec = JSON.parse(line);
  let uid = rec.id; 
  let url = 'perms/users?query=userId==' + uid;
  const res = await steps.goto(url);
  if (res.totalRecords === 0) {
	  let msg = {
		  msg: 'No perm/user found',
		  userRec: rec
          };
	  throw(JSON.stringify(msg));
  }
  return;
}

module.exports = { action };
