/*
 * This script will delete orders by a list of poNumbers
*/


const action = async (pon, steps) => {
	let ep = 'orders/composite-orders';
	let res = await steps.goto(`${ep}?query=poNumber==${pon}`)
	if (res.purchaseOrders && res.purchaseOrders[0]) {
		let rec = res.purchaseOrders[0];
		let id = rec.id;
		let url = `${ep}/${id}`;
		if (!rec.compositePoLines) {
			await steps.delete(url);
			await steps.save(rec);
		} else {
			throw new Error(`PO line found on "${pon}"`);
		}
	} else { throw new Error(`Order with PO number "${pon}" not found`) }
	return;
}

module.exports = { action };
