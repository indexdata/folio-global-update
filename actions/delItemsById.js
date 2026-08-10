/*
 * This script will delete items from a list of item IDs
*/


const action = async (id, steps) => {
	let ep = `item-storage/items/${id}`;
	await steps.delete(ep);
	return;
}

module.exports = { action };
