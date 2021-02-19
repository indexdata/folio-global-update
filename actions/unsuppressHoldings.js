metadata = {
  endpoint: 'holdings-storage/holdings'
};

const action = (record) => {
  record.discoverySuppress = false;
  return record;
}

module.exports = { metadata, action };
