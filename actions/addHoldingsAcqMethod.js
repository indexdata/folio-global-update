/*
 Takes a JSONL file of charles formated MFHD records, searches holdings by 001 and
 adds maps and added byte 7 from the 008 to holdings.acquisitionMethod
*/

const action = async (inRec, steps) => {
  let rec = JSON.parse(inRec);
  let f001 = (rec['001']) ? rec['001'][0] : '';
  let f008 = (rec['008']) ? rec['008'][0] : '';
  if (f001 && f008) {
  	let hrid = 'ph' + f001;
  	const qurl = `holdings-storage/holdings?query=hrid==${hrid}`;
  	const res = await steps.goto(qurl);
  	if (res.totalRecords > 0) {
		let amap = {
  			"c": "Cooperative or consortial purchase",
  			"d": "Deposit",
  			"e": "Exchange",
  			"f": "Free",
  			"g": "Gift",
  			"l": "Legal deposit",
  			"m": "Membership",
  			"n": "Non-library purchase",
  			"p": "Purchase",
  			"q": "Lease",
  			"u": "Unknown",
  			"z": "Other method of acquisition"
		};
		let c = f008.substring(7, 8);
		let astr = amap[c] || amap.u;
		let r = res.holdingsRecords[0];
		delete r.holdingsItems;
		delete r.bareHoldingsItems;
		r.acquisitionMethod = astr;
		let surl = 'holdings-storage/holdings/' + r.id;
		await steps.send(surl, r);
		await steps.preview(r);
  	}
  }
  return;
}

module.exports = { action };
