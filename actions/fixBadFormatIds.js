/*
 * This script will will delete the double UUID in the instanceFormatIds field
 * It will take a file of instance records in JSONL format.
*/


const action = async (id, steps) => {
  let ep = 'instance-storage/instances';
  let inst = JSON.parse(id);
  let rec = await steps.goto(ep + '/' + inst.id);
  if (rec) {
	 rec.instanceFormatIds[0] = rec.instanceFormatIds[0].replace(/ .+$/, '')
	 await steps.preview(rec);
  	 await steps.send(ep + '/' + inst.id, rec);
  }
  return;
}

module.exports = { action };
