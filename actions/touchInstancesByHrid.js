/*
 * Given a list of HRIDs, this script will touch instance records
*/

const action = async (line, steps) => {
  let h = line.split(/\t/);
  let hrid = h[0].trim();
  let qurl = `inventory/instances?query=hrid==${hrid}`;
  const res = await steps.goto(qurl);
  if (res && res.instances[0]) {
	let r = res.instances[0];
	let url = `inventory/instances/${r.id}`;
  	if (r) {
  		await steps.send(url, r);
		await steps.sleep(250);
  	}
  }
  return;
}

module.exports = { action };
