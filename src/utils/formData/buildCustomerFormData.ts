type CustomerFormBase = {
  name: string;
  avatar?: { uri: string; name: string; type: string } | null;
};

export function buildCustomerFormData(data: CustomerFormBase): FormData {
  const formData = new FormData();
  formData.append("customer[name]", data.name);

  if (data.avatar) {
    formData.append("customer[avatar]", {
      uri: data.avatar.uri,
      name: data.avatar.name,
      type: data.avatar.type,
    } as unknown as Blob);
  }

  return formData;
}
