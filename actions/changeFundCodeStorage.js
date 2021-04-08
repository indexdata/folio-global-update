/* 
If status is "Open"

1. GET orders/composite-orders/{poId}

2. Change workflowStatus to "Pending"
   PUT orders/composite-orders/{poId}

3. Change compositePoLines[0].fundDistribution.fundId to new Fund ID.
   Change compositePoLines[0].fundDistribution.code to new Fund code
   Change workflowStatus to "Open"
   PUT orders/composite-orders/{poId}
*/

const metadata = {
  name: "Change fund codes by PO line ID",
  // newFundId: '054869c7-84a9-46ec-9339-56ba033432e0',
  newFundId: '666b283a-d390-48b4-bc5a-fa113652cb63',
  newFundCode: 'TEST2'
};

const action = async (id, steps) => {
  // get po line
  let lineUrl = `orders-storage/po-lines/${id}`
  let poLine = await steps.goto(lineUrl);

  let trans = [];
  // change po line in composite order
  poLine.fundDistribution.forEach(f => {
    f.fundId = metadata.newFundId;
    f.code = metadata.newFundCode;
    trans.push(f.encumbrance);
  });

  steps.preview(poLine);

  trans.forEach(async t => {
    let turl = `finance-storage/transactions/${t}`;
    let tran = await steps.goto(turl);
    tran.fromFundId = metadata.newFundId;
    steps.preview(tran);
    await steps.send(turl, tran);
  });

  // put changes
  await steps.send(lineUrl, poLine);

  return;
} 

module.exports = { action };
