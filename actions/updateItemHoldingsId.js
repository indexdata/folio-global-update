const action = async (item, steps) => {
  let ep = 'item-storage/items';
  let ir = JSON.parse(item);
  let rec = await steps.goto(ep + '/' + ir.id);
  if (rec) {
	rec.holdingsRecordId = ir.holdingsRecordId;
  	await steps.send(ep + '/' + rec.id, rec);
  }
  return;
}

module.exports = { action };
