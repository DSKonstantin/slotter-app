export type SegmentOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

export type SegmentedControlProps = {
  options: SegmentOption[];
  value: string;
  className?: string;
  segmentClassName?: string;
  segmentLabelClassName?: string;
  activeSegmentClassName?: string;
  inactiveSegmentClassName?: string;
  onChange: (value: string) => void;
};
