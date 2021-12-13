
const action = async (id, steps) => {
  let data = id.split(/\t/);
  let items = await steps.goto(`item-storage/items?query=barcode==${data[0]}`);
  let itemId = items.items[0].id;
  let loans = await steps.goto(`loan-storage/loans?query=itemId==${itemId}`);
  let loanId = loans.loans[0].id;
  let url = `circulation/loans/${loanId}/change-due-date`;
  let ddObj = { dueDate: data[1] };
  await steps.post(url, ddObj);
  return;
}

module.exports = { action };
