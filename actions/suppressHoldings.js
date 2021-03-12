const action = async (id, steps) => {
  const url = `holdings-storage/holdings/${id}`;
  const record = await steps.goto(url);
  record.discoverySuppress = true;
  steps.preview(record);
  await steps.send(url, record);
  return;
}

module.exports = { action };
