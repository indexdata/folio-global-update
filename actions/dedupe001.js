/*
 Removes multiple 001 fields in an SRS record.
*/

const action = async (id, steps) => {
  let url = `source-storage/records/${id}`;
  const record = await steps.goto(url);
  let c = 0;
  for (let x = 0; x < record.parsedRecord.content.fields.length; x++) {
	let f = record.parsedRecord.content.fields[x];
	if (f['001']) {
	  if (c > 0) {
		  let newField = { '009' : f['001'] };
		  record.parsedRecord.content.fields.splice(x, 1, newField);
		  // x--;
	  }
	  c++;
	}
  }
  steps.preview(record);
  await steps.send(`source-storage/records/${id}`, record);
  return;
}

module.exports = { action };
