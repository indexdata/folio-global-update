const action = async (id, steps) => {
  const endPoint = `locations/${id}`;
  let rec = await steps.goto(endPoint);
  steps.term.log(rec);
  if (rec) await steps.save(rec);
  return;
}

module.exports = { action };
