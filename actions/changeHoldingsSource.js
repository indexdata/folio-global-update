/*
 * This script will change a holdings record sourceId to FOLIO 
 * It will take a list of holdings IDs as input.
*/


const action = async (id, steps) => {
  let ep = 'holdings-storage/holdings';
  let sourceId = 'f32d531e-df79-46b3-8932-cdd35f7a2264' // FOLIO
  let rec = await steps.goto(ep + '/' + id);
  if (rec) {
	 rec.sourceId = sourceId;
	 await steps.preview(rec);
  	 await steps.send(ep + '/' + id, rec);
  }
  return;
}

module.exports = { action };
