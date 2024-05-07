/*
  This action script will set the discoverySuppress property of an instance record to true.
  Since this script targets the inventory/instances endpoint, FOLIO will set discoverySuppress
  to true in the source record also.
*/

const action = async (id, steps) => {
  id = id.replace(/,.+$/, '');
  let url = `inventory/instances/${id}`;
  const record = await steps.goto(url);
  if (record.discoverySuppress) return;
  record.discoverySuppress = true;
  steps.preview(record);
  await steps.send(url, record);
  await steps.sleep(250);
  return;
}

module.exports = { action };
