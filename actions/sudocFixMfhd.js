const action = async (id, steps) => {
  let ep = 'holdings-storage/holdings';
  let rep = 'records-editor/records';
  let cnType = 'fc388041-6cd0-4806-8a74-ebe3b9ab4c6e' // sudoc
  let hr = JSON.parse(id);
  let recs = await steps.goto(ep + '?query=hrid==' + hr.id);
  let rec = (recs.holdingsRecords) ? recs.holdingsRecords[0] : '';
  if (rec) {
	  let murl = `${rep}?externalId=${rec.id}`;
	  let mfhd = await steps.goto(murl);
	  if (mfhd && mfhd.fields) {
		  for (x = 0; x < mfhd.fields.length; x++) {
			  let f = mfhd.fields[x];
			  if (f.tag === '852') {
				  f.content = f.content.replace(/ *\$[hi] [^$]+/, '');
				  f.content += ` $h ${hr.cn}`;
				  f.indicators[0] = '3';
				  break;
			  }
	          }
		  mfhd.leader = mfhd.leader.replace(/^(.....)\\/, '$1n');
		  mfhd.leader = mfhd.leader.replace(/^(......)\\/, '$1y');
		  mfhd.leader = mfhd.leader.replace(/^(.{17})\\/, '$1u');
		  mfhd.relatedRecordVersion = `${rec._version}`;
		  await steps.preview(mfhd);
		  await steps.send(`${rep}/${mfhd.parsedRecordId}`, mfhd);
          }
  }
  await steps.sleep(1000);
  return;
}

module.exports = { action };
