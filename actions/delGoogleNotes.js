/*
*/


const action = async (item, steps) => {
	let base = 'item-storage/items';
	let rec = JSON.parse(item);
	let url = base + '/' + rec.id;
	let gnote = '7a46e1ca-d2eb-49a3-9935-59bed639e6f1';
	let otext = {};
	if (rec.notes) {
		for (let x = 0; x < rec.notes.length; x++) {
			let text = rec.notes[x].note;
			otext[text] = 1;
		}
	}
	let i = await steps.goto(url);
	if (i && i.notes) {
		for (let x = 0; x < i.notes.length; x++) {
			let n = i.notes[x];
			let ctext = n.note;
			if (otext[ctext]) {
				i.notes.splice(x, 1);
				x--;
			}
		}
		await steps.preview(i);
		await steps.send(url, i);
	}
	return;
}

module.exports = { action };
