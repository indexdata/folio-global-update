/*
 * This script will delete items by a list of item HRID
*/


const action = async (hrid, steps) => {
	let ep = 'item-storage/items';
	let res = await steps.goto(`${ep}?query=hrid==${hrid}`)
	if (res.items && res.items[0]) {
		let rec = res.items[0];
		let id = rec.id;
		if (id) {
			let url = `${ep}/${id}`;
			await steps.delete(url);
		}
	} else { throw new Error(`Item with HRID ${hrid} not found`) }
	return;
}

module.exports = { action };
