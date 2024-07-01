/*
 * This script will read a tsv file of po numbers, vendor accounts, physical unit price and
     * fetch po-line object from orders-storage/po-lines by searching by poLineNumber
     * grab the uuid of said po-line
     * change the vendorDetail.vendorAccount to whatever is in the spreadsheet
     * PUT the updated object to orders-storage/po-lines/{uuid}
     * GET orders-storage/order-lines/{uuid}
     * change cost.listUnitprice to whatever is in the spreadsheet
     * PUT the the updated object orders/order-lines/{uuid}
*/

const action = async (line, steps) => {
	let [ poNum, accNum, priceStr ] = line.split(/\t/);
	let price = parseFloat(priceStr);
	let base = 'orders-storage/po-lines';
	let obase = 'orders/order-lines';
	let surl = base + '?' + 'query=poLineNumber==' + poNum;
	let res = await steps.goto(surl);
	let pol = res.poLines[0];
	if (pol) {
		let id = pol.id
		if (pol.vendorDetail) {
			pol.vendorDetail.vendorAccount = accNum;
		} else {
			pol.vendorDetail = { instructions: "", vendorAccount: accNum, referenceNumbers: [] };
		}
		let url = base + '/' + id;
		await steps.send(url, pol);
		if (pol.cost.poLineEstimatedPrice === price) {
			ourl = obase + '/' + id;
			pol.cost.listUnitPrice = price;
			pol.cost.poLineEstimatedPrice = price;
			let val = { cost: pol.cost, fundDistribution: pol.fundDistribution };
			await steps.term.log(val);
			await steps.send('orders/order-lines/fund-distributions/validate', val);
			await steps.send(ourl, pol);
		}
		await steps.preview(pol);
	} else {
		throw(`POL record not found for ${poNum}`);
	}
	return;
}

module.exports = { action };
