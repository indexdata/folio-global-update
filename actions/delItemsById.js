/*
 * This script will delete items with effectiveLocationId fed77359-381b-598e-8a7b-0c68a2810f32
*/


const action = async (id, steps) => {
	let ep = `item-storage/items/${id}`;
	await steps.delete(ep);
	return;
}

module.exports = { action };
