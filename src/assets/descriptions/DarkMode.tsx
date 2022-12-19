import * as React from 'react';
import { SVG_OUTLINE_COLOR } from '@/assets/config';
// import { SVG_FILLED_COLOR, SVG_FILLED_BACKGROUND } from '@/assets/config';

// {props.theme == 'dark' ? SVG_OUTLINE_COLOR.DARK : SVG_OUTLINE_COLOR.LIGHT}
// {props.theme == 'dark' ? SVG_FILLED_COLOR.DARK : SVG_FILLED_COLOR.LIGHT}
// {props.theme == 'dark' ? SVG_FILLED_BACKGROUND.DARK : SVG_FILLED_BACKGROUND.LIGHT}

const DarkMode = (
  props: JSX.IntrinsicAttributes &
    React.SVGProps<SVGSVGElement> & {
      theme?: string;
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
      d="m24.003 4 5.27 5.27h9.457v9.456l5.27 5.27-5.27 5.278v9.456h-9.456L24.004 44l-5.278-5.27H9.27v-9.456L4 23.997l5.27-5.27V9.27h9.456L24.003 4Z"
      stroke={props.theme == 'dark' ? SVG_OUTLINE_COLOR.DARK : SVG_OUTLINE_COLOR.LIGHT}
      strokeWidth={4}
      strokeMiterlimit={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M27 17c0 8-5 9-10 9 0 4 6.5 8 12 4s2-13-2-13Z"
      stroke={props.theme == 'dark' ? SVG_OUTLINE_COLOR.DARK : SVG_OUTLINE_COLOR.LIGHT}
      strokeWidth={4}
      strokeMiterlimit={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default DarkMode;
