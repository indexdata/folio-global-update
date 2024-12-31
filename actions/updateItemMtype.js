/*
 * Get an item record by item ID and then update the materialTypeId to whatever is after ":" in the input file.
*/


const action = async (line, steps) => {
	let [ id, mt ] = line.split(/:/);
	let ep = 'item-storage/items/' + id;
	let rec = await steps.goto(ep);
	if (rec && rec.materialTypeId !== mt) {
		rec.materialTypeId = mt;
		await steps.send(ep, rec);
		await steps.preview(rec);
	}
	return;
}

module.exports = { action };
