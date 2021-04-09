/*
  This script will change the fundId and fundCode of a PO line.
  In other words, change funds.
*/

const metadata = {
  name: "Change fund codes by PO line ID",
  // newFundId: '3663b6b3-7728-4815-ab94-4816bbba7908',
  // newFundCode: '4SET'
  newFundId: '1bdbf0f1-7ab6-4a7d-8de1-fbe9ba23f25c',
  newFundCode: 'ENG'
};

const action = async (id, steps) => {
  // get po line
  let lineUrl = `orders/order-lines/${id}`
  let poLine = await steps.goto(lineUrl);

  // change the fund distribution of po line
  poLine.fundDistribution.forEach(f => {
    f.fundId = metadata.newFundId;
    f.code = metadata.newFundCode;
  });

  // add locations (for testing purposes)
  if (poLine.locations && poLine.locations.length === 0) {
    steps.term.log("Adding locations object...");
    poLine.locations = [ { locationId: '7677cfcf-65fd-54bd-bd97-411ea418df9f', quantityPhysical: 1} ];
  }

  steps.preview(poLine);

  // put changes
  await steps.send(lineUrl, poLine);

  return;
} 

module.exports = { action };
