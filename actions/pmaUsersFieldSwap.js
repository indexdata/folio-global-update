/*
  Reads users from a jsonl file, gets the freshest record from FOLIO and...
  1) Move the current barcode into a custom "former identifier" field.
  2) Move the current username into the barcode field.
  3) Copy the email address into the username field.
*/

const action = async (inRec, steps) => {
	let u = JSON.parse(inRec);
	let id = u.id;
	let url = `users/${id}`;
	let user = await steps.goto(url);
	if (!user.username.match(/mod-|system|pubsub|admin/i)) {
		if (!user.customFields && user.barcode) {
			user.customFields = {};
		}
		if (user.barcode) {
			user.customFields.formerIdentifier = user.barcode;
			delete user.barcode;
		}
		if (user.username) {
			user.barcode = user.username;
			delete user.username;
		}
		if (user.personal.email) {
			user.username = user.personal.email;
		}
		await steps.preview(user);
		await steps.send(url, user);
	} else {
		await steps.term.log(`User ${user.username} is a system user-- no change!`)
	}
	return;
}

module.exports = { action };
