/*
 * This script will delete items with effectiveLocationId fed77359-381b-598e-8a7b-0c68a2810f32
*/


const action = async (item, steps) => {
	let locId = 'fed77359-381b-598e-8a7b-0c68a2810f32'
	let iep = 'item-storage/items';
	let ir = JSON.parse(item);
	if (ir.effectiveLocationId === locId) {
		let url = iep + '/' + ir.id;
		await steps.delete(url);
	}
	return;
}

module.exports = { action };
