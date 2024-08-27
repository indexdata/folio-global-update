/*
 * This script will search coursereserves/courselisting from a list of term names or UUIDs.
 * It will delete the courselisting objects that match so that the terms may be deleted.
*/

const action = async (line, steps) => {
	let id;
	line = line.trim();
	if (line.match(/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/)) {
		id = line;
	} else {
		let qs = encodeURIComponent(line);
		let q = `?query=name==${qs}`;
		let cl = await steps.goto(`coursereserves/terms${q}`);
		if (cl.terms[0]) {
			id = cl.terms[0].id;
		}
	}
	if (id) {
		let ts = await steps.goto(`coursereserves/courselistings?query=termId==${id}&limit=1000`);
		let c = 0;
		let ic = 0;
		for (let x = 0; x < ts.courseListings.length; x++) {
			let lid = ts.courseListings[x].id;
			let lur = `coursereserves/courselistings/${lid}`;
			let ins = await steps.goto(lur + '/instructors');
			for (let y = 0; y < ins.instructors.length; y++) {
				let iid = ins.instructors[y].id;
				let iurl = `${lur}/instructors/${iid}`;
				await steps.delete(iurl);
				ic++;
			}
			await steps.delete(lur);
			c++;
		}
		await steps.term.log(`  INFO ${c} course listings with ${ic} instructors deleted`);
	}
	return;
}

module.exports = { action };
