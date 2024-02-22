const action = async (marc, steps) => {
  let mapper = 'http://localhost:8888/marc2inst';
  let res = await steps.post(mapper, marc);
  for (x = 0; x < res.instances.length; x++) {
    let r = res.instances[x];
    await steps.post('instance-storage/instances', r);
  };
  await steps.post('source-storage/snapshots', res.snapshot); 
  for (x = 0; x < res.records.length; x++) {
    let r = res.records[x];
    await steps.post('source-storage/records', r); 
  }
  return;
}

module.exports = { action };
