/*
 This script will search for "Will not lend" ILL policies in holdings records.  It will get a batch of 1000,
 change the ILL policy to "Will lend" and send the batch to holdings-storage.  It will read the
 revolutions limit from a data file which should contain a single line with an integer.
*/

const action = async (line, steps) => {
	const lim = parseInt(line, 10);
	const willLend = '46970b40-918e-47a4-a45d-b1677a2d3d46';
	const willNotLend = 'b0f97013-87f5-4bab-87f2-ac4a5191b489';
	const postUrl = 'holdings-storage/batch/synchronous?upsert=true';
	const searchUrl = `holdings-storage/holdings?limit=1000&query=illPolicyId==${willNotLend}&stats=false`
	for (let x = 1; x <= lim; x++) {
		steps.term.log(`Rev ${x} of ${lim}...`);
		let hr = await steps.goto(searchUrl);
		let ttl = hr.totalRecords;
		if (!ttl) break;
		steps.term.log(`Total records ${ttl}`);
		hr.holdingsRecords.forEach(h => {
			h.illPolicyId = willLend;
		});
		delete(hr.totalRecords);
		delete(hr.resultInfo);
		await steps.post(postUrl, hr);
	}
  	return;
}

module.exports = { action };
