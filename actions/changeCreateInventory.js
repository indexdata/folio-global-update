const action = async (id, steps) => {
	const url = `orders-storage/po-lines/${id}`;
	const record = await steps.goto(url);
	const ihi = 'Instance, Holding, Item';
	if (record) {
		if (record.physical) {
			record.physical.createInventory = ihi;
		} else if (record.eresource) {
			record.eresource.createInventory = ihi;
		}
		await steps.preview(record);
		await steps.send(url, record);
	}
	return;
}

module.exports = { action };
