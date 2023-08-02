/*
 Takes a list of barcodes and changes the item status to Available.
*/

const action = async (id, steps) => {
  let item = await steps.goto(`item-storage/items/${id}`);
  // steps.term.log(item);
  let cn = item.circulationNotes;
  if (cn) {
	for (x = 0; x < cn.length; x++) { 
		let n = cn[x];
		let ustr = `${id}--${x}`;
		n.id = await steps.uuidgen(ustr);
	}
  }
  await steps.preview(item);
  await steps.send(`item-storage/items/${item.id}`, item);
  return;
}

module.exports = { action };
