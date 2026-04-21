import * as Yup from "yup";

export const descriptionField = Yup.string()
  .max(500, "Максимум 500 символов")
  .ensure();
