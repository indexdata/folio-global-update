/*
  This will get instances by id and display them (mostly for testing). 
*/

const action = async (id, steps) => {
  let url = `inventory/instances/${id}`;
  const record = await steps.goto(url);
  await steps.term.log(record);
  await steps.sleep(60000);
  return;
}

module.exports = { action };
