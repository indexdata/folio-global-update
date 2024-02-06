/*
 * This script will suppress instances that used to have Ciampi holdings.
 * Do not suppress if it has holdings attached.
*/


const action = async (item, steps) => {
	let hep = 'holdings-storage/holdings';
	let iep = 'instance-storage/instances';
	let hr = JSON.parse(item);
	let instId = hr.instanceId;
	let hrecs = await steps.goto(hep + '?query=instanceId=' + instId);
	if (hrecs.totalRecords === 0) {
		let instRec = await steps.goto(iep + '/' + instId);
		instRec.discoverySuppress = true;
		instRec.staffSuppress = true;
		await steps.preview(instRec);
		await steps.send(iep + '/' + instId, instRec);
	} else {
		throw(`WARN Holdings attached to ${instId}`);
	}
	return;
}

module.exports = { action };
