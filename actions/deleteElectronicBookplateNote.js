/*
  This action script will take a file of holdingsIds and delete all electronic bookplate
  notes from a holdings record.
*/

const action = async (line, steps) => {
  let [ id, value ] = line.split('\t');
  const url = `holdings-storage/holdings/${id}`;
  const record = await steps.goto(url);
  record.notes.forEach((n, index) => {
    if (n.holdingsNoteTypeId === '88914775-f677-4759-b57b-1a33b90b24e0') {
      record.notes.splice(index, 1);
    }
  });
  steps.preview(record);
  await steps.send(url, record);
  return;
}

module.exports = { action };
