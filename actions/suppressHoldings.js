metadata = {
  endpoint: 'holdings-storage/holdings'
};

const action = async (id, steps) => {
  const url = `holdings-storage/holdings/${id}`;
  const record = await steps.goto(url);
  record.discoverySuppress = true;
  await steps.send(url, record);
  return;
}

module.exports = { metadata, action };
