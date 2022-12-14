import * as React from 'react';
import { SVG_OUTLINE_COLOR } from '@/assets/config';
// import { SVG_FILLED_COLOR, SVG_FILLED_BACKGROUND } from '@/assets/config';

// {props.theme == 'dark' ? SVG_OUTLINE_COLOR.DARK : SVG_OUTLINE_COLOR.LIGHT}
// {props.theme == 'dark' ? SVG_FILLED_COLOR.DARK : SVG_FILLED_COLOR.LIGHT}
// {props.theme == 'dark' ? SVG_FILLED_BACKGROUND.DARK : SVG_FILLED_BACKGROUND.LIGHT}

const Edit = (
  props: JSX.IntrinsicAttributes &
    React.SVGProps<SVGSVGElement> & {
      theme?: string;
    }
) => (
  <svg
    width={18}
    height={18}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M7 42h36"
      stroke={props.theme == 'dark' ? SVG_OUTLINE_COLOR.DARK : SVG_OUTLINE_COLOR.LIGHT}
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11 26.72V34h7.317L39 13.308 31.695 6 11 26.72Z"
      stroke={props.theme == 'dark' ? SVG_OUTLINE_COLOR.DARK : SVG_OUTLINE_COLOR.LIGHT}
      strokeWidth={4}
      strokeLinejoin="round"
    />
  </svg>
);

export default Edit;
