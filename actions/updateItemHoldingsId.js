/*
 * This script will search for a holdings record by holdings hrid (which is stored in the item's
 * holdingsRecordId property) and update the item with the proper holdings id found by the search.
*/


const action = async (item, steps) => {
	let hep = 'holdings-storage/holdings?query=hrid==';
	let iep = 'item-storage/items';
	let ir = JSON.parse(item);
	let hrid = ir.holdingsRecordId; // this should be the holdings hrid.
	let useHid = false;
	let hid = '';
	if (hrid.match(/^........-....-....-....-............/)) {
		useHid = true;
		hid = hrid;
	}
	if (!useHid) {
		let hrecs = await steps.goto(hep + hrid);
		hrec = (hrecs && hrecs.holdingsRecords) ? hrecs.holdingsRecords[0] : '';
		if (hrec) hid = hrec.id;
	}
	if (hid) {
		let irec = await steps.goto(iep + '/' + ir.id);
		if (irec) {
			irec.holdingsRecordId = hid;
			if (ir.itemLevelCallNumber) {
				irec.itemLevelCallNumber = ir.itemLevelCallNumber;
				irec.itemLevelCallNumberTypeId = ir.itemLevelCallNumberTypeId;
			}
			await steps.preview(irec);
			await steps.send(iep + '/' + irec.id, irec);
		}
	}
	return;
}

module.exports = { action };
