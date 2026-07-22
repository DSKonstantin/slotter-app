import * as Yup from "yup";

export const descriptionField = Yup.string()
  .max(600, "Максимум 600 символов")
  .ensure();
