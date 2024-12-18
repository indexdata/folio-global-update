/*
 * Takes an item record and updates the notes fields only.
*/


const action = async (item, steps) => {
	let ep = 'item-storage/items';
	let ir = JSON.parse(item);
	let id = ir.id;
	let url = ep + '/' + id;
	let res = await steps.goto(url);
	if (res.notes) {
		res.notes = ir.notes;
		await steps.send(url, res);
	}
	steps.preview(res);
	return;
}

module.exports = { action };
