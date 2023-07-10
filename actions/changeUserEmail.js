/*
 Takes a list of barcodes and changes the item status to Available.
*/

const action = async (inRec, steps) => {
  let user = JSON.parse(inRec);
  let id = user.id;
  let email = user.personal.email;
  let url = `users/${id}`;
  let rec = await steps.goto(url);
  rec.personal.email = email;
  steps.preview(rec);
  await steps.send(url, rec);
  return;
}

module.exports = { action };
