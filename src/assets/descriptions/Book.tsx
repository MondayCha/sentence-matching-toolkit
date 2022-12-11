import * as React from 'react';
import { SVG_OUTLINE_COLOR } from '@/assets/config';

// {props.isDark ? SVG_OUTLINE_COLOR.DARK : SVG_OUTLINE_COLOR.LIGHT}
// {props.isDark ? SVG_FILLED_COLOR.DARK : SVG_FILLED_COLOR.LIGHT}
// {props.isDark ? SVG_FILLED_BACKGROUND.DARK : SVG_FILLED_BACKGROUND.LIGHT}

const Book = (
  props: JSX.IntrinsicAttributes &
    React.SVGProps<SVGSVGElement> & {
      isDark?: boolean | undefined;
    }
) => (
  <svg
    width={30}
    height={30}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M7 37V11a6 6 0 0 1 6-6h22v26H13c-3.3 0-6 2.684-6 6Z"
      stroke={props.isDark ? SVG_OUTLINE_COLOR.DARK : SVG_OUTLINE_COLOR.LIGHT}
      strokeWidth={4}
      strokeLinejoin="round"
    />
    <path
      d="M35 31H13a6 6 0 0 0 0 12h28V7M14 37h20"
      stroke={props.isDark ? SVG_OUTLINE_COLOR.DARK : SVG_OUTLINE_COLOR.LIGHT}
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default Book;
