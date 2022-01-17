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

export interface TrackableAttributeBase {
  trackable_attribute_id: number;
  name: string;
  enabled: boolean;
  sort: number;
}

export interface TrackableAttributeNumber extends TrackableAttributeBase {
  attribute_type: 'number';
  constraints: {
    min?: number;
    max?: number;
  };
}

export interface TrackableAttributeText extends TrackableAttributeBase {
  attribute_type: 'text';
}

export interface TrackableAttributeCategorical extends TrackableAttributeBase {
  attribute_type: 'category';
}

export type TrackableAttribute =
  | TrackableAttributeNumber
  | TrackableAttributeText
  | TrackableAttributeCategorical;

export function blankAttribute(initialSort: number): TrackableAttribute {
  return {
    trackable_attribute_id: -1,
    name: '',
    attribute_type: 'number',
    enabled: true,
    sort: initialSort,
    constraints: {},
  };
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
