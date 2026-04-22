type UserFormBase = {
  name: string;
  surname: string;
  profession: string;
  avatar?: { uri: string; name: string; type: string } | null;
};

export function buildUserFormData(data: UserFormBase): FormData {
  const formData = new FormData();
  formData.append("user[first_name]", data.name);
  formData.append("user[last_name]", data.surname);
  formData.append("user[profession]", data.profession);

  if (data.avatar) {
    formData.append("user[avatar]", {
      uri: data.avatar.uri,
      name: data.avatar.name,
      type: data.avatar.type,
    } as unknown as Blob);
  }

  return formData;
}
