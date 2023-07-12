const action = async (id, steps) => {
  const ep = 'holdings-storage/holdings';
  const url = `${ep}?query=hrid==${id}`;
  const recs = await steps.goto(url);
  let record = recs.holdingsRecords[0];
  if (record) {
  	record.discoverySuppress = true;
  	steps.preview(record);
	let surl = `${ep}/${record.id}`;
  	await steps.send(surl, record);
  }
  return;
}

module.exports = { action };
