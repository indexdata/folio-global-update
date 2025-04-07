/*
 Given a file of items in jsonl format, this script will get and immediately put the item 
 back it item storage.
*/
const action = async (inRec, steps) => {
  let rec = JSON.parse(inRec);
  let id = rec.id
  const url = `item-storage/items/${id}`;
  const r = await steps.goto(url);
  if (r) {
  	await steps.send(url, r);
  }
  return;
}

module.exports = { action };
