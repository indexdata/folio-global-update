/*
 This action takes purchase orders and finds all attached POLs
 If the checkinItems property is set to false, the script will change it to false.
*/

const action = async (line, steps) => {
	let base = 'orders-storage/po-lines';
	let rec = JSON.parse(line);
	let url = `${base}?query=purchaseOrderId==${rec.id}`; 
	let pols = await steps.goto(url);
	for (let x = 0; x < pols.poLines.length; x++) {
		let pol = pols.poLines[x];
		if (pol.checkinItems) {
			await steps.term.log(`WARN ${pol.id} is already true-- skipping`);
		} else {
			pol.checkinItems=true;
			await steps.preview(pol);
			await steps.send(`${base}/${pol.id}`, pol);
		}
	}
	return;
}

module.exports = { action };
