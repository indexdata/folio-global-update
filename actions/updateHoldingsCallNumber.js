/*
 * This script will change a holdings record callNumber to whatever is in the incoming record. 
*/


const action = async (line, steps) => {
	let ep = 'holdings-storage/holdings/';
	let inRec = JSON.parse(line);
	let id = inRec.id;
	let inCall = inRec.callNumber;
	let inCallType = inRec.callNumberTypeId;
	let rec = await steps.goto(ep + id);
	if (rec) {
		let sendFlag = true;
		if (rec.callNumber && !inCall) {
			delete rec.callNumber;
			delete rec.callNumberTypeId;
		} else if (rec.callNumber && inCall && rec.callNumber !== inCall) {
			rec.callNumber = inCall;
			rec.callNumberTypeId = inCallType;
		} else {
			throw new Error(`Callnumber not changed for ${id} ("${inCall}" --> "${rec.callNumber}")`);
			sendFlag = false;
		}
		await steps.preview(rec);
		if (sendFlag) await steps.send(ep + id, rec);
	}
	return;
}

module.exports = { action };
