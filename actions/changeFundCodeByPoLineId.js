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
  newFundId: '8357b8f7-5756-49b8-b0be-4e32453270cc',
  newFundCode: 'TEST1'
};

const action = async (id, steps) => {
  let lineUrl = `orders/order-lines/${id}`
  let poLine = await steps.goto(lineUrl);
  let poUrl = `orders/composite-orders/${poLine.purchaseOrderId}`;
  let po = await steps.goto(poUrl);
  po.compositePoLines.forEach(c => {
    if (c.id == id) {
      c.fundDistribution.forEach(f => {
        f.fundId = metadata.newFundId;
        f.code = metadata.newFundCode;
      });
    }
  });
  steps.preview(po);
  let previousStatus = po.workflowStatus;
  po.workflowStatus = 'Pending';
  await steps.send(poUrl, po);
  po.workflowStatus = 'Open';
  await steps.send(poUrl, po);
  return;
} 

module.exports = { metadata, action };
