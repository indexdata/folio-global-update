/*
 Given a file of item IDs, this script will get and immediately put the item 
 back it item storage.
*/

const action = async (id, steps) => {
  const url = `item-storage/items/${id}`;
  const r = await steps.goto(url);
  if (r) {
  	await steps.send(url, r);
  }
  return;
}

module.exports = { action };
