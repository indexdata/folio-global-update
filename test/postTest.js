const metadata = {
  description: "This script will add JSONL records to location-units/institutions"
};

const action = async (rec, steps) => {
  const endPoint = `location-units/institutions`;
  await steps.post(endPoint, rec);
  return;
}

module.exports = { metadata, action };
