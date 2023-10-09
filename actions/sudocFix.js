const action = async (id, steps) => {
  let ep = 'holdings-storage/holdings';
  let cnType = 'fc388041-6cd0-4806-8a74-ebe3b9ab4c6e' // sudoc
  let hr = JSON.parse(id);
  let recs = await steps.goto(ep + '?query=hrid==' + hr.id);
  let rec = (recs.holdingsRecords) ? recs.holdingsRecords[0] : '';
  if (rec) {
	 rec.callNumber = hr.cn;
	 rec.callNumberTypeId = cnType;
	 await steps.preview(rec);
  	 await steps.send(ep + '/' + rec.id, rec);
  }
  return;
}

module.exports = { action };
