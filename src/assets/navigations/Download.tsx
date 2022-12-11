import * as React from 'react';
import { SVG_OUTLINE_COLOR } from '@/assets/config';

// {props.isDark ? SVG_OUTLINE_COLOR.DARK : SVG_OUTLINE_COLOR.LIGHT}
// {props.isDark ? SVG_FILLED_COLOR.DARK : SVG_FILLED_COLOR.LIGHT}
// {props.isDark ? SVG_FILLED_BACKGROUND.DARK : SVG_FILLED_BACKGROUND.LIGHT}

const Download = (
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
      d="M5 8a2 2 0 0 1 2-2h12l5 6h17a2 2 0 0 1 2 2v26a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8Z"
      stroke={props.isDark ? SVG_OUTLINE_COLOR.DARK : SVG_OUTLINE_COLOR.LIGHT}
      strokeWidth={4}
      strokeLinejoin="round"
    />
    <path
      d="m30 28-6.007 6L18 28.013M24 20v14"
      stroke={props.isDark ? SVG_OUTLINE_COLOR.DARK : SVG_OUTLINE_COLOR.LIGHT}
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default Download;
