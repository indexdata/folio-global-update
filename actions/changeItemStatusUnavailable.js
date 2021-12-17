/*
 Takes a list of barcodes and changes the item status to Unavailable.
*/

const action = async (id, steps) => {
  let records = await steps.goto(`item-storage/items?query=barcode==${id}%20and%20status.name=Available`);
  let item = records.items[0];
  if (!item) {
	  steps.term.log(`No item with status Available found for ${id}`);
	  return;
  }
  item.status.name = 'Unavailable';
  steps.preview(item);
  await steps.send(`item-storage/items/${item.id}`, item);
  return;
}

module.exports = { action };
