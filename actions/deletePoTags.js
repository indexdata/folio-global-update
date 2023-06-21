/*
 Takes a list of barcodes and changes the item status to Available.
*/

const action = async (id, steps) => {
  let po = await steps.goto(`orders-storage/purchase-orders/${id}`);
  // steps.term.log(po);
  if (po.tags) {
  	delete po.tags;
  	steps.term.log(po);
  	await steps.send(`orders-storage/purchase-orders/${id}`, po);
  }
  return;
}

module.exports = { action };
