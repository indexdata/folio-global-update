/*
 * This script will change a holdings record instanceId.
 * It will take a list of holdings IDs and instance HRIDs. 
*/


const action = async (id, steps) => {
	let ep = 'holdings-storage/holdings';
	let [hid, hrid] = id.split(/\t/);
	let insts = await steps.goto(`instance-storage/instances?query=hrid==${hrid}`);
	let instId = (insts && insts.instances[0]) ? insts.instances[0].id : '';
	await steps.term.log(instId);
	let hrec = await steps.goto(`${ep}/${hid}`);
	if (hrec && instId) {
		hrec.instanceId = instId;
		await steps.preview(hrec);
		await steps.send(`${ep}/${hrec.id}`, hrec);
	}
	return;
}

module.exports = { action };
