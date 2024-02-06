/*
 * This script will delete items with permanentLocationId of fed77359-381b-598e-8a7b-0c68a2810f32
*/


const action = async (item, steps) => {
	let locId = 'fed77359-381b-598e-8a7b-0c68a2810f32'
	let iep = 'holdings-storage/holdings';
	let hr = JSON.parse(item);
	if (hr.permanentLocationId === locId) {
		let url = iep + '/' + hr.id;
		await steps.delete(url);
	}
	return;
}

module.exports = { action };
