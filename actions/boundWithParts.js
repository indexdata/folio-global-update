const action = async (line, steps) => {
  if (line.match(/^\d/)) {
    let [ epn, bc, other ] = line.split(/\t/);
    const url = `item-storage/items?query=hrid==${epn}`;
    const res = await steps.goto(url);
    if (res.items[0]) {
      let item = res.items[0];
      let iid = item.id;
      let hid = item.holdingsRecordId;
      let bwid = await steps.uuidgen(iid);
      let bwObj = {
        id: bwid,
        holdingsRecordId: hid,
        itemId: iid
      }
      // steps.term.log(bwObj);
      await steps.post('inventory-storage/bound-with-parts', bwObj);
    }
    
    // steps.preview(items);
  }
  return;
}

module.exports = { action };
