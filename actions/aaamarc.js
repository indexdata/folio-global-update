const action = async (marc, steps) => {
  let mapper = 'http://localhost:8888/marc2inst';
  let res = await steps.post(mapper, marc);
  for (x = 0; x < res.instances.length; x++) {
    let r = res.instances[x];
    await steps.post('instance-storage/instances', r);
  };
  return;
}

module.exports = { action };
