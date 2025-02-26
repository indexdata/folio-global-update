/*
 * Takes an item record and updates the copyNumber only.
*/


const action = async (item, steps) => {
	let ep = 'item-storage/items';
	let ir = JSON.parse(item);
	let id = ir.id;
	let url = ep + '/' + id;
	let res = await steps.goto(url);
	if (ir.copyNumber) {
		res.copyNumber = ir.copyNumber;
		await steps.send(url, res);
	}
	steps.preview(res);
	return;
}

module.exports = { action };
