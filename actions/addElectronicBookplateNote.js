/*
  This action script will take a tab delimited file with holdingsId in the first column
  and note text in the second.  It will add a new electronic bookplate note if no note
  of the same type exists.  If no note of the same time DOES exist, it will update the
  existing note. 
*/

const action = async (line, steps) => {
  let [ id, value ] = line.split('\t');
  const url = `holdings-storage/holdings/${id}`;
  let found = false;
  const record = await steps.goto(url);
  if (record.notes === undefined) record.notes = [];
  if (record.notes.length > 0) {
    record.notes.forEach(n => {
      if (n.holdingsNoteTypeId === '88914775-f677-4759-b57b-1a33b90b24e0') {
        n.note = value;
        found = true;
      }
    });
  }
  if (!found) {
    let note = {
      note: value,
      staffOnly: false,
      holdingsNoteTypeId: '88914775-f677-4759-b57b-1a33b90b24e0'
    }
    record.notes.push(note);
  }
  steps.preview(record);
  await steps.send(url, record);
  return;
}

module.exports = { action };
