import React from "react";
import { SvgXml } from "react-native-svg";

const svg = `<svg width="28" height="26" viewBox="0 0 28 26" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="13.698" height="17.9549" rx="3.4" transform="matrix(0.854634 0.519231 -0.823041 0.567981 14.7778 8.68945)" fill="#97E44E" fill-opacity="0.8"/>
  <rect width="13.698" height="17.9549" rx="3.4" transform="matrix(0.854634 0.519231 -0.823041 0.567981 16.293 0)" fill="#B8F660" fill-opacity="0.72"/>
</svg>`;

type Props = {
  size?: number;
};

export const SlotterLogo = ({ size = 28 }: Props) => (
  <SvgXml xml={svg} width={size} height={size * (26 / 28)} />
);
