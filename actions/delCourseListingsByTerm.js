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
		let cc = 0;
		let rc = 0;
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
			let courses = await steps.goto(`coursereserves/courses?query=courseListingId==${lid}`)
			for (let y = 0; y < courses.courses.length; y++) {
				let courseId = courses.courses[y].id
				let curl = `coursereserves/courses/${courseId}`;
				await steps.delete(curl);
				cc++;
			}
			let res = await steps.goto(`coursereserves/reserves?query=courseListingId==${lid}`)
			for (let y = 0; y < res.reserves.length; y++) {
				let resId = res.reserves[y].id
				let rurl = `coursereserves/reserves/${resId}`;
				await steps.delete(rurl);
				rc++;
			}
			await steps.delete(lur);
			c++;
		}
		await steps.delete(`coursereserves/terms/${id}`);
		await steps.term.log(`  INFO ${c} course listings with ${ic} instructors, ${cc} courses and ${ic} reserves deleted`);
	}
	return;
}

module.exports = { action };
