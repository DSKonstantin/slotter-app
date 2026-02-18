export type SegmentOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

export type SegmentedControlProps = {
  options: SegmentOption[];
  value: string;
  className?: string;
  onChange: (value: string) => void;
};
