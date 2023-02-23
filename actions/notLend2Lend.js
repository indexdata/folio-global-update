const action = async (line, steps) => {
	const willLend = '46970b40-918e-47a4-a45d-b1677a2d3d46';
	const willNotLend = 'b0f97013-87f5-4bab-87f2-ac4a5191b489';
	const postUrl = 'holdings-storage/batch/synchronous';
	const searchUrl = `holdings-storage/holdings?limit=1000&query=illPolicyId==${willNotLend}&stats=false`
	let hr = await steps.goto(searchUrl);
	let ttl = hr.totalRecords;
	steps.term.log(`Total records ${ttl}`);
	hr.holdingsRecords.forEach(h => {
		h.illPolicyId = willLend;
	});
	delete(hr.totalRecords);
	await steps.post(postUrl, hr);
  	return;
}

module.exports = { action };
