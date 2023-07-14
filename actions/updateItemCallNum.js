/*
 * This script will search for a holdings record by holdings hrid (which is stored in the item's
 * holdingsRecordId property) and update the item with the proper holdings id found by the search.
*/


const action = async (item, steps) => {
	let iep = 'item-storage/items';
	let ir = JSON.parse(item);
	if (ir.holdingsRecordId.match(/^........-....-....-....-............/)) {
		let irec = await steps.goto(iep + '/' + ir.id);
		if (irec) {
			irec.itemLevelCallNumber = ir.itemLevelCallNumber;
			irec.itemLevelCallNumberTypeId = ir.itemLevelCallNumberTypeId;
			await steps.preview(irec);
			await steps.send(iep + '/' + irec.id, irec);
		}
	}
	return;
}

module.exports = { action };
