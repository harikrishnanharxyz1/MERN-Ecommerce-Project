export function getSellingPrice(product) {
  return Number(product?.discountPrice ?? product?.price ?? 0);
}

export function getDiscountPercentage(product) {
  const originalPrice = Number(product?.price);
  const sellingPrice = getSellingPrice(product);
  if (!originalPrice || sellingPrice >= originalPrice) return 0;
  return Math.round(((originalPrice - sellingPrice) / originalPrice) * 100);
}
