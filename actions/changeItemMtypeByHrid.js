const action = async (id, steps) => {
  let ep = 'item-storage/items';
  let recs = await steps.goto(ep + '?query=hrid==' + id);
  let rec = (recs.items) ? recs.items[0] : '';
  if (rec) {
	rec.materialTypeId = '875ffe4c-f299-50e8-825d-087257f04bd0' // Sound recordings - No Prospector
  	await steps.send(ep + '/' + rec.id, rec);
	steps.preview(rec);
  }
  return;
}

module.exports = { action };
