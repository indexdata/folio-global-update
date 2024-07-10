/*
 * This script will touch inventory records which will also 
 * set the additionalInfo.discoverySuppress in SRS, thus making them in sync.
*/
const action = async (inRec, steps) => {
  let rec = JSON.parse(inRec);
  let id = rec.id
  const url = `inventory/instances/${id}`;
  const r = await steps.goto(url);
  if (r) {
  	await steps.send(url, r);
  }
  return;
}

module.exports = { action };
