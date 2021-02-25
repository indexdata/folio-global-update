metadata = {
  // endpoint: 'circulation/loans',
  postEndpoint: 'circulation/loans/{id}/change-due-date',
};

const action = (record) => {
  record = {};
  record.dueDate = '2021-06-15T23:59:00.000+00:00'
  return record;
}

module.exports = { metadata, action };
