import * as React from 'react';
import { SVG_FILLED_BACKGROUND, SVG_FILLED_COLOR } from '@/assets/config';

const AdditionFilled = (
  props: JSX.IntrinsicAttributes &
    React.SVGProps<SVGSVGElement> & {
      isDark?: boolean | undefined;
    }
) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M10 44h28a2 2 0 0 0 2-2V14H30V4H10a2 2 0 0 0-2 2v36a2 2 0 0 0 2 2Z"
      fill={props.isDark ? SVG_FILLED_COLOR.DARK : SVG_FILLED_COLOR.LIGHT}
      stroke={props.isDark ? SVG_FILLED_COLOR.DARK : SVG_FILLED_COLOR.LIGHT}
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="m30 4 10 10"
      stroke={props.isDark ? SVG_FILLED_COLOR.DARK : SVG_FILLED_COLOR.LIGHT}
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M24 21v14M17 28h14"
      stroke={props.isDark ? SVG_FILLED_BACKGROUND.DARK : SVG_FILLED_BACKGROUND.LIGHT}
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default AdditionFilled;
