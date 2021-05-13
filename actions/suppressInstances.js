/*
  This action script will set the discoverySuppress property of an instance record to true.
  Since this script targets the inventory/instances endpoint, FOLIO will set discoverySuppress
  to true in the source record also.
*/

const action = async (id, steps) => {
  const url = `inventory/instances/${id}`;
  const record = await steps.goto(url);
  record.discoverySuppress = true;
  steps.preview(record);
  await steps.send(url, record);
  return;
}

module.exports = { action };
