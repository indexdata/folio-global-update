/*
 Takes a list of barcodes and adds an item tag.
*/

const action = async (id, steps) => {
  let tag = 'damaged';
  let records = await steps.goto(`item-storage/items?query=barcode==${id}`);
  let item = records.items[0];
  if (!item) {
	  steps.term.log(`No item found for ${id}`);
	  return;
  }
  if (!item.tags) { 
    item.tags = { tagList: [] };
  } else {
    for (let x = 0; x < item.tags.tagList; x++) {
      if (item.tags.tagList[x] === tag) {
	steps.term.log(`The tag ${tag} already exists for this item`);
	return;
      }
    }
  }
  item.tags.tagList.push(tag);
  steps.preview(item);
  await steps.send(`item-storage/items/${item.id}`, item);
  return;
}

module.exports = { action };
