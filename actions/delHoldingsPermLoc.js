/*
 * This script will delete the superfluous permanentLocation property from
 * holdings records.
*/

const action = async (line, steps) => {
	let hr = JSON.parse(line);
	if (hr.permanentLocation) {
		let id = hr.id;
		const url = `holdings-storage/holdings/${id}`;
		const record = await steps.goto(url);
		if (record.permanentLocation) {
			delete record.permanentLocation;
			steps.preview(record);
			await steps.send(url, record);
		}
	}
	return;
}

module.exports = { action };
