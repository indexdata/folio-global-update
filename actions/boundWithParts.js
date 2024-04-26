const action = async (line, steps) => {
  if (line.match(/^\d/)) {
    let [ epn, other ] = line.split(/\t/);
    let mainRes = await steps.getCache(epn);
    const mainUrl = `item-storage/items?query=hrid==${epn}`;
    const otherUrl = `holdings-storage/holdings?query=hrid==${other}`;
    if (!mainRes) { 
      mainRes = await steps.goto(mainUrl);
      if (mainRes.items[0]) {
        let iid = mainRes.items[0].id;
        let hid = mainRes.items[0].holdingsRecordId;
        let bwid = await steps.uuidgen(hid + iid);
        let bwObj = {
          id: bwid,
          holdingsRecordId: hid,
          itemId: iid
        }
        await steps.post('inventory-storage/bound-with-parts', bwObj);
      }
      await steps.putCache(epn, mainRes);
    }
    const otherRes = await steps.goto(otherUrl);
    if (mainRes.items[0] && otherRes.holdingsRecords[0]) {
      let mainItem = mainRes.items[0];
      let otherItem = otherRes.holdingsRecords[0];
      let iid = mainItem.id;
      let hid = otherItem.id;
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
