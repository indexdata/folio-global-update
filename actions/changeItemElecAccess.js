/*
  Changes all electronicAccess URLs based on an input line that is tab separated.
  First column is instance ID while the second column is the value of url.
*/

const action = async (id, steps) => {
  let data = id.split(/\t/);
  let url = `holdings-storage/holdings?query=instanceId==${data[0]}`;
  let record = await steps.goto(url);
  let hid = record.holdingsRecords[0].id;
  record = await steps.goto(`item-storage/items?query=holdingsRecordId=${hid}`);
  record.items[0].electronicAccess.forEach(e => {
    e.uri = data[1];
  });
  steps.preview(record);
  let iid = record.items[0].id;
  await steps.send(`item-storage/items/${iid}`, record.items[0]);
  return;
}

module.exports = { action };
