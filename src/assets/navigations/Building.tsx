import * as React from 'react';
import { SVG_OUTLINE_COLOR } from '@/assets/config';

const Building = (
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
      clipRule="evenodd"
      d="m17 14 27 10v20H17V14Z"
      stroke={props.theme == 'dark' ? SVG_OUTLINE_COLOR.DARK : SVG_OUTLINE_COLOR.LIGHT}
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17 14 4 24v20h13M35 44V32l-9-3v15M44 44H17"
      stroke={props.theme == 'dark' ? SVG_OUTLINE_COLOR.DARK : SVG_OUTLINE_COLOR.LIGHT}
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default Building;
