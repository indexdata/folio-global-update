/*
 Given a file of reserve object, this script will search for an instance by instanceId and 
 add the instanceHrid to the reserve object and then PUT it.
*/

const action = async (line, steps) => {
  let rr = JSON.parse(line);
  let orig = JSON.parse(line);
  if (!rr.instanceHrid) {
  	let iid = rr.copiedItem.instanceId;
  	let inst = await steps.goto(`instance-storage/instances/${iid}`);
	if (inst) {
		rr.copiedItem.instanceHrid = inst.hrid;
		rr.copiedItem.instanceDiscoverySuppress = false;
		await steps.send(`coursereserves/reserves/${rr.id}`, rr);
		await steps.preview(rr, orig);
	}
  }
  return;
}

module.exports = { action };
