import * as d3 from 'd3';
import { contrastingColor } from './colors';

export interface Trackable {
  trackable_id: number;
  name: string;
  enabled: boolean;
  multiple_per_day: boolean;
  sort: number;
  color: string;
}

export function colorVars(color: d3.LabColor) {
  let { bgColor, textColor, hoverTextColor, hoverBgColor } = contrastingColor(color);

  return [
    `--trackable-bg-color:${bgColor}`,
    `--trackable-text-color:${textColor}`,
    `--trackable-hover-bg-color:${hoverBgColor}`,
    `--trackable-hover-text-color:${hoverTextColor}`,
  ].join(';');
}
