/*
  Changes all 856$u fields based on an input line that is tab separated.
  First column is instance ID while the second column is the value of 856$u
*/

const action = async (id, steps) => {
  let data = id.split(/\t/);
  let url = `change-manager/parsedRecords?instanceId=${data[0]}`;
  const record = await steps.goto(url);
  record.parsedRecord.content.fields.forEach(f => {
    if (f['856']) {
      f['856'].subfields.forEach(s => {
        if (s.u) {
          s.u = data[1];
        }
      });
    }
  });
  steps.preview(record);
  await steps.send(`change-manager/parsedRecords/${data[0]}`, record);
  return;
}

module.exports = { action };
