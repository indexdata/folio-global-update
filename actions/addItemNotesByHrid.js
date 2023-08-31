/*
*/


const action = async (line, steps) => {
	let base = 'item-storage/items';
	let rec = JSON.parse(line);
	let url = `${base}?query=hrid==${rec.hrid}`; 
	let items = await steps.goto(url);
	let item = items.items[0];
	if (!item) return;
	let mkeys = {};
	item.notes.forEach(n => {
		let mkey = n.itemNoteTypeId + n.note;
		mkeys[mkey] = 1;
	});
	for (let x = 0; x < rec.notes.length; x++) {
		let n = rec.notes[x];
		let mkey = n.itemNoteTypeId + n.note;
		if (!mkeys[mkey]) {
			item.notes.push(n);
		}
	}
	await steps.preview(item);
	await steps.send(`${base}/${item.id}`, item);
	return;
}

module.exports = { action };
