// mathUtils.js - Service calculation utility
function calculateTotal(items = [], discount = 0, taxRate = 0) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price * (1 + taxRate);
  }
  return (total - discount).toFixed(2);
}

module.exports = { calculateTotal };