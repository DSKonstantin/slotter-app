// Квотная маскировка клиента: мастерам без PRO записи, созданные сверх
// бесплатного месячного лимита, приходят с клиентом-заглушкой
// {id: null, name: "—", phone: "—"} — клиент существует, но скрыт до
// апгрейда (бэк: appointment_blueprint.rb, Appointment.free_limited_ids).
// Отличать от честного customer: null — там клиента у записи нет вовсе.
export function isHiddenCustomer(
  customer: { id: number | null } | null | undefined,
): boolean {
  return customer != null && customer.id == null;
}
