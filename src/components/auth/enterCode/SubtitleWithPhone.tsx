import React from "react";
import { Typography } from "@/src/components/ui";

type SubtitleWithPhoneProps = {
  text: string;
  phone: string;
};

export const SubtitleWithPhone = ({ text, phone }: SubtitleWithPhoneProps) => {
  const index = phone ? text.indexOf(phone) : -1;

  if (index === -1) {
    return (
      <>
        <Typography className="text-body text-neutral-500">{text}</Typography>
        {!!phone && (
          <Typography weight="semibold" className="text-body text-black mt-1">
            {phone}
          </Typography>
        )}
      </>
    );
  }

  return (
    <Typography className="text-body text-neutral-500">
      {text.slice(0, index)}
      <Typography weight="semibold" className="text-body text-black">
        {phone}
      </Typography>
      {text.slice(index + phone.length)}
    </Typography>
  );
};
