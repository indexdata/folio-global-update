const action = async (rec, steps) => {
  let record = JSON.parse(rec);
  const endPoint = `location-units/institutions/${record.id}`;
  steps.preview(record);
  await steps.send(endPoint, rec);
  return;
}

module.exports = { action };
