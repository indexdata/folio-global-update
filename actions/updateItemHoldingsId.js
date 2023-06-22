/*
 * This script will search for a holdings record by holdings hrid (which is stored in the item's
 * holdingsRecordId property) and update the item with the proper holdings id found by the search.
*/


const action = async (item, steps) => {
	let hep = 'holdings-storage/holdings?query=hrid==';
	let iep = 'item-storage/items';
	let ir = JSON.parse(item);
	let hrid = ir.holdingsRecordId; // this should be the holdings hrid.
	let hrecs = await steps.goto(hep + hrid);
	let hrec = (hrecs && hrecs.holdingsRecords) ? hrecs.holdingsRecords[0] : '';
	if (hrec) {
		let hid = hrec.id;
		let irec = await steps.goto(iep + '/' + ir.id);
		if (irec) {
			irec.holdingsRecordId = hid;
			await steps.send(iep + '/' + irec.id, irec);
		}
	}
	return;
}

module.exports = { action };
