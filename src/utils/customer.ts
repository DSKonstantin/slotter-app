export function isHiddenCustomer(
  customer: { id: number | null } | null | undefined,
): boolean {
  return customer != null && customer.id == null;
}
