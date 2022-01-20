/*
 Takes a list of hrids and changes the item barcode to the value
 in the incoming tsv file.
*/

const action = async (id, steps) => {
  let data = id.split(/\t/);
  let records = await steps.goto(`item-storage/items?query=hrid==${data[0]}`);
  let item = records.items[0];
  if (item) {
    let hid = item.holdingsRecordId;
    let oldbc = item.barcode;
    item.barcode = data[1];
    steps.preview(item);
    if (data[1] !== oldbc) {
	    await steps.send(`item-storage/items/${item.id}`, item);
    } else {
	    steps.term.log(`WARN barcode ${oldbc} is the same-- item not changed`);
    }
    let holdings = await steps.goto(`holdings-storage/holdings/${hid}`);
    let oldloc = holdings.permanentLocationId;
    let oldcall = holdings.callNumber;
    holdings.permanentLocationId = data[2];
    holdings.callNumber = data[3];
    steps.preview(holdings);
    if (data[2] !== oldloc || data[3] !== oldcall) {
	    await steps.send(`holdings-storage/holdings/${hid}`, holdings);
    } else {
	    steps.term.log(`WARN values are the same-- holdings record not changed`);
    }
  } else {
    	  steps.term.log(`No item found for ${data[0]}`)
	  // check for existance of item barcode...
  	  let records = await steps.goto(`item-storage/items?query=barcode==${data[1]}`);
	  // if no item, then create holdings/item...
	  if (!records.items[0]) {
	  	let newHoldings = {
		  	instanceId: data[5],
		  	permanentLocationId: data[2],
		  	callNumber: data[3],
		  	hrid: 'x' + data[0],
	  	}
	  	let nh = await steps.post('holdings-storage/holdings', newHoldings);
	  	let newItem = {
		  	holdingsRecordId: nh.id,
		  	materialTypeId: data[4],
		  	permanentLoanTypeId: '6694256e-3057-444d-8a19-bf9a840306d4',
		  	status: { name: 'Unavailable' },
		  	barcode: data[1],
		  	hrid: data[0]
	  	}
	  	await steps.post('item-storage/items', newItem);
	  } else {
		  throw Error(`Item with ${data[1]} already exists`);
          }
  }
  return;
}

module.exports = { action };
