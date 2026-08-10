/*
  This script will take a csv file of users and update the Collections field to true
*/


const action = async (line, steps) => {
	let f = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
	let id = f[7];
	let ep = `users/${id}`;
	let u = await steps.goto(ep);
	if (u) {
		u.customFields.collections = true;
		await steps.send(ep, u);
		await steps.preview(u);
	}
	return;
}

module.exports = { action };
