/*
 Takes failedUsers objects from mod-user-import.
 Searches by username and changes externalSystemId to the value in the error log
*/

const action = async (inRec, steps) => {
	let err = JSON.parse(inRec);
	let un = err.username;
	let eid = err.externalSystemId;
	let url = `users?query=username==${un}`;
	let users = await steps.goto(url);
	let rec = users.users[0];
	if (rec && rec.externalSystemId !== eid) {
		rec.externalSystemId = eid;
		await steps.send(`users/${rec.id}`, rec);
	}
	else {
		throw(`      WARN ${un} doesn not need updating -- skipping`);
	}
	return;
}

module.exports = { action };
