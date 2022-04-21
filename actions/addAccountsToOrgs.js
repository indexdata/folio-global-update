
const action = async (id, steps) => {
  let c = id.split(/\t/);
  let records = await steps.goto(`organizations-storage/organizations?query=code==${c[0]}`);
  let org = records.organizations[0];
  org.erpCode = c[2];
  steps.preview(org);
  await steps.send(`organizations-storage/organizations/${org.id}`, org);
  return;
}

module.exports = { action };
