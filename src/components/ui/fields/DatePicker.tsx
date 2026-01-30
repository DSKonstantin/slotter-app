// import React, { ReactNode, useState } from "react";
// import DatePickerLib, { type DatePickerProps } from "react-native-date-picker";
// import { BaseField } from "@/src/components/ui/fields/BaseField";
// import { FieldError } from "react-hook-form";
// import { Pressable, TextInput } from "react-native";
// import { colors } from "@/src/styles/colors";
//
// type DatePickerType = {
//   value: string;
//   onChange: (value: Date) => void;
//   label?: string;
//   placeholder?: string;
//   error?: FieldError;
//   disabled?: boolean;
//   hideErrorText?: boolean;
//
//   startAdornment?: ReactNode;
//   endAdornment?: ReactNode;
// } & DatePickerProps;
//
// export const DatePicker = ({
//   value,
//   onChange,
//   label,
//   placeholder,
//   error,
//   hideErrorText,
//   disabled,
//   startAdornment,
//   endAdornment,
//   ...props
// }: DatePickerType) => {
//   const [open, setOpen] = useState(false);
//
//   return (
//     <BaseField
//       label={label}
//       error={error}
//       hideErrorText={hideErrorText}
//       disabled={disabled}
//       startAdornment={startAdornment}
//       endAdornment={endAdornment}
//       renderControl={() => (
//         <>
//           <Pressable
//             className="flex-1"
//             disabled={disabled}
//             onPress={() => setOpen(true)}
//           >
//             <TextInput
//               editable={false}
//               value={value}
//               placeholder={placeholder}
//               className="flex-1 font-inter-regular text-primary text-[16px] px-4"
//               placeholderTextColor={colors.gray.muted}
//             />
//           </Pressable>
//           <DatePickerLib
//             open={open}
//             onConfirm={(d) => {
//               setOpen(false);
//               onChange(d);
//             }}
//             onCancel={() => {
//               setOpen(false);
//             }}
//             {...props}
//           />
//         </>
//       )}
//     />
//   );
// };
