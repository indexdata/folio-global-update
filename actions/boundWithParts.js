const action = async (line, steps) => {
  if (line.match(/^\d/)) {
    let [ epn, bc, other ] = line.split(/\t/);
    const mainUrl = `item-storage/items?query=hrid==${epn}`;
    const otherUrl = `item-storage/items?query=hrid==${other}`;
    const mainRes = await steps.goto(mainUrl);
    const otherRes = await steps.goto(otherUrl);
    if (mainRes.items[0] && otherRes.items[0]) {
      let mainItem = mainRes.items[0];
      let otherItem = otherRes.items[0];
      let iid = mainItem.id;
      let hid = otherItem.holdingsRecordId;
      let bwid = await steps.uuidgen(hid+iid);
      let bwObj = {
        id: bwid,
        holdingsRecordId: hid,
        itemId: iid
      }
      await steps.post('inventory-storage/bound-with-parts', bwObj);
    }
  }
  return;
}

module.exports = { action };
