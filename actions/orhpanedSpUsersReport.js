/*
 Takes a file of service point users and checks the userId against users and reports  back on not found users.
*/

const action = async (line, steps) => {
  let spu = JSON.parse(line);
  let uid = spu.userId;
  let url = 'users?query=id==' + uid;
  const res = await steps.goto(url);
  if (res.totalRecords === 0) {
	  let msg = {
		  msg: 'No user found',
		  spuId: spu.id,
		  userId: uid
          };
	  throw(JSON.stringify(msg));
  }
  return;
}

module.exports = { action };
