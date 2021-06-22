/*
 Takes a list of barcodes and changes the item status to Available.
*/

const action = async (id, steps) => {
  let records = await steps.goto(`item-storage/items?query=barcode==${id}`);
  let item = records.items[0];
  // steps.term.log(item);
  item.status.name = 'Available';
  // steps.term.log(item);
  await steps.send(`item-storage/items/${item.id}`, item);
  return;
}

module.exports = { action };
