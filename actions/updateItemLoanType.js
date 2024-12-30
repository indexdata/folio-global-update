/*
 * Get a item record by item ID and then update the permanentLoanTypeId to whatever plt is.
*/


const action = async (id, steps) => {
	let plt = '4e054876-7771-4ec2-a085-1126390048b5';
	let ep = 'item-storage/items/' + id;
	let rec = await steps.goto(ep);
	if (rec && rec.permanentLoanTypeId !== plt) {
		rec.permanentLoanTypeId = plt;
		await steps.send(ep, rec);
		await steps.preview(rec);
	}
	return;
}

module.exports = { action };
