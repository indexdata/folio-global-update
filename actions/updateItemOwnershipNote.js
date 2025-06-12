/*
 * Takes an item record for STU and updates the ownership notes fields only.
*/


const action = async (line, steps) => {
	let ep = 'item-storage/items';
	let c = line.split('|');
	let hrid = 'ui' + c[0];
	let url = `${ep}?query=hrid==${hrid}`;
	let list = await steps.goto(url);
	if (list.totalRecords === 1) {
		let rec = list.items[0];
		if (rec.notes) {
			rec.notes.forEach(n => {
				if (n.itemNoteTypeId === '34207e4e-5cd7-4eab-801b-b0326cd5c66a') {
					if (c[1] && c[2]) { 
						n.note = `${c[1]} - ${c[2]}`;
					} else if (c[1]) {
						n.note = c[1];
					}
				}
			});
		}
		let surl = ep + '/' + rec.id;
		await steps.send(surl, rec);
		await steps.preview(rec);
	}
	return;
}

module.exports = { action };
