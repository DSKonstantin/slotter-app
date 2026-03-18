import * as Yup from "yup";

const categorySchema = Yup.object().shape({
  name: Yup.string().required("Введите название категории"),
  color: Yup.string().nullable().optional(),
});

export default categorySchema;
