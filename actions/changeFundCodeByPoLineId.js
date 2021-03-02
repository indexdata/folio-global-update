metadata = {
  endpoint: 'orders/order-lines'
};

const action = (record) => {
  record.fundDistribution.forEach(fd => {
    fd.fundId = 'e105a452-672a-402f-a734-53ac7c0e2ad3';
    fd.code = 'LEDV2';
    fd.encumbrance = 'e00bf3a7-5bb1-48d5-b32c-5ec8c3f4921d';
  });
  return record;
}

module.exports = { metadata, action };
