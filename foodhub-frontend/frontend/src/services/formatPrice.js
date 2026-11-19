// Shows a price with 2 decimals, for example 250 becomes "250.00"
function formatPrice(amount) {
  return Number(amount).toFixed(2);
}

export default formatPrice;
