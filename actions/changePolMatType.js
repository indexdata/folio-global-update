/*
 Takes a list of barcodes and changes the item status to Available.
*/

const action = async (id, steps) => {
  let url = `orders-storage/po-lines/${id}`;
  let rec = await steps.goto(url);
  rec.eresource.materialType = '326f9725-f681-5569-878c-b72fa31865ee' // streaming video acq 
  steps.preview(rec);
  await steps.send(url, rec);
  return;
}

module.exports = { action };
