const action = async (id, steps) => {
  const url = `inventory/instances/${id}`;
  const record = await steps.goto(url);
  record.discoverySuppress = false;
  steps.preview(record);
  await steps.send(url, record);
  return;
}

module.exports = { action };
