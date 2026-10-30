import type { JSX } from "react";

export type GardenItemProps = {
  variant?: number;
  className?: string;
  title?: string;
};

export type GardenItemDefinition = {
  key: string;
  name: string;
  blurb: string;
  footprint: "small" | "medium" | "large";
  Component: (props: GardenItemProps) => JSX.Element;
};
