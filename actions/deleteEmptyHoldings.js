const action = async (id, steps) => {
	let ep = 'holdings-storage/holdings';
	let res = await steps.goto(ep + '?limit=1000&query=instance.hrid==' + id);
	let recs = res.holdingsRecords;
	for (let x = 0; x < recs.length; x++) {
		let hr = recs[x];
		if (hr.hrid.match(/^b/)) {
			let items = await steps.goto('item-storage/items?query=holdingsRecordId==' + hr.id + '&limit=1');
			let count = items.totalRecords;
			if (count === 0 && hr.id) {
				await steps.term.log(count);
				await steps.delete(ep + '/' + hr.id);
			}
		}
	}
	return;
}

module.exports = { action };
