/*
 * Takes a list of externalSystemIds and sets active to false
*/

const action = async (exid, steps) => {
	let surl = `users?query=externalSystemId==${exid}`;
	let users = await steps.goto(surl);
	let rec = users.users[0];
	if (rec) {
		rec.active = false;
		await steps.send(`users/${rec.id}`, rec);
		await steps.preview(rec);
	}
	else {
		throw(`      WARN ${exid} not found`);
	}
	return;
}

module.exports = { action };
