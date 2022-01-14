/*
 Takes a list of barcodes and changes/adds item discoverySuppress to true.
*/

const action = async (id, steps) => {
  let records = await steps.goto(`item-storage/items?query=barcode==${id}`);
  let item = records.items[0];
  item.discoverySuppress = true;
  steps.preview(item);
  await steps.send(`item-storage/items/${item.id}`, item);
  return;
}

module.exports = { action };
