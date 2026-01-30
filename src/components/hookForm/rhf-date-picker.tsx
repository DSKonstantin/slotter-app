// import React, { ReactNode } from "react";
// import { Controller, useFormContext } from "react-hook-form";
// import { DatePicker } from "@/src/components/ui";
// import { DatePickerProps } from "react-native-date-picker";
//
// type DatePickerFieldsProps = {
//   name: string;
//   label?: string;
//   placeholder?: string;
//   hideErrorText?: boolean;
//   startAdornment?: ReactNode;
//   endAdornment?: ReactNode;
//
//   formatValue?: (date: Date) => string;
//   parseValue?: (value: string) => Date | null;
// } & DatePickerProps;
//
// export function RhfDatePicker({
//   name,
//   label,
//   placeholder,
//   startAdornment,
//   endAdornment,
//   hideErrorText,
//   formatValue,
//   parseValue,
//   ...other
// }: DatePickerFieldsProps) {
//   const { control } = useFormContext();
//   return (
//     <Controller
//       control={control}
//       name={name}
//       render={({ field: { onChange, value }, fieldState: { error } }) => (
//         <DatePicker
//           value={value}
//           label={label}
//           placeholder={placeholder}
//           error={error}
//           hideErrorText={hideErrorText}
//           startAdornment={startAdornment}
//           endAdornment={endAdornment}
//           onChange={(d) => {
//             if (formatValue) {
//               onChange(formatValue(d));
//             }
//           }}
//           {...other}
//         />
//       )}
//     />
//   );
// }
