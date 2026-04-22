type ServiceFormValues = {
  name: string;
  price: string;
  duration: string;
  description: string;
  isAvailableOnline: boolean;
  isActive: boolean;
  additionalServices?: { serviceId: number }[];
};

export function buildServiceFormData(values: ServiceFormValues): FormData {
  const formData = new FormData();
  formData.append("service[name]", values.name.trim());
  formData.append("service[price]", String(Number(values.price)));
  formData.append("service[duration]", String(Number(values.duration)));
  formData.append("service[description]", values.description.trim());
  formData.append(
    "service[is_available_online]",
    String(values.isAvailableOnline),
  );
  formData.append("service[is_active]", String(values.isActive));

  const ids = values.additionalServices?.map((s) => s.serviceId) ?? [];
  if (!ids.length) {
    formData.append("service[additional_service_ids][]", "");
  } else {
    ids.forEach((id) => {
      formData.append("service[additional_service_ids][]", String(id));
    });
  }

  return formData;
}
