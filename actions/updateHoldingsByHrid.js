const action = async (id, steps) => {
  let ep = 'holdings-storage/holdings';
  let hr = JSON.parse(id);
  let recs = await steps.goto(ep + '?query=hrid==' + hr.hrid);
  let rec = (recs.holdingsRecords) ? recs.holdingsRecords[0] : '';
  if (rec) {
	 rec.callNumber = hr.callNumber;
	 rec.callNumberTypeId = hr.callNumberTypeId;
	 await steps.preview(rec);
  	 await steps.send(ep + '/' + rec.id, rec);
  } else {
	  await steps.post(ep, hr);
  }
  return;
}

module.exports = { action };
