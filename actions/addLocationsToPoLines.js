/*
  This script will add locations objects to po lines. 
*/

const action = async (id, steps) => {
  // get po line
  let lineUrl = `orders-storage/po-lines/${id}`
  let poLine = await steps.goto(lineUrl);

  let location = '7677cfcf-65fd-54bd-bd97-411ea418df9f';

  // get piece
  if (poLine.orderFormat === 'Physical Resource') {
    let pieceUrl = `orders-storage/pieces?query=poLineId==${poLine.id}`;
    let pieces = await steps.goto(pieceUrl, 1);
    if (pieces.pieces.length === 1 && pieces.pieces[0].locationId) {
      location = pieces.pieces[0].locationId;
    }
  }

  // add locations
  poLine.locations = [ 
    {
      locationId: location,
      quantityPhysical: poLine.cost.quantityPhysical || 0,
      quantityElectronic: poLine.cost.quantityElectronic || 0,
    }
  ];

  await steps.preview(poLine);

  // put changes
  await steps.send(lineUrl, poLine);

  return;
} 

module.exports = { action };
