/*
 Takes a list of hrids and changes the item barcode to the value
 in the incoming tsv file.
*/

const action = async (id, steps) => {
  let data = id.split(/\t/);
  let records = await steps.goto(`item-storage/items?query=hrid==${data[0]}`);
  let item = records.items[0];
  let oldbc = item.barcode;
  item.barcode = data[1];
  steps.preview(item);
  if (data[1] !== oldbc) {
	  await steps.send(`item-storage/items/${item.id}`, item);
  } else {
	  steps.term.log(`WARN barcode ${oldbc} is the same-- item not changed`)
  }
  return;
}

module.exports = { action };
