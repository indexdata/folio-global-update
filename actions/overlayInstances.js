const action = async (inRec, steps) => {
  let rec = JSON.parse(inRec);
  let id = rec.id
  const url = `instance-storage/instances/${id}`;
  const r = await steps.goto(url);
  rec._version = r._version
  steps.preview(rec);
  await steps.send(url, rec);
  return;
}

module.exports = { action };
