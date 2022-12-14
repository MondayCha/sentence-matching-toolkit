import * as React from 'react';
import { SVG_OUTLINE_COLOR } from '@/assets/config';

// {props.theme == 'dark' ? SVG_OUTLINE_COLOR.DARK : SVG_OUTLINE_COLOR.LIGHT}
// {props.theme == 'dark' ? SVG_FILLED_COLOR.DARK : SVG_FILLED_COLOR.LIGHT}
// {props.theme == 'dark' ? SVG_FILLED_BACKGROUND.DARK : SVG_FILLED_BACKGROUND.LIGHT}

const Branch = (
  props: JSX.IntrinsicAttributes &
    React.SVGProps<SVGSVGElement> & {
      theme?: string;
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
      d="M24 33V15M10 9h28v6H10zM8 32l6-7h19.974L40 32M4 33h8v8H4zM20 33h8v8h-8zM36 33h8v8h-8z"
      stroke={props.theme == 'dark' ? SVG_OUTLINE_COLOR.DARK : SVG_OUTLINE_COLOR.LIGHT}
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default Branch;
