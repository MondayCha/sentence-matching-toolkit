import * as React from 'react';
import { SVG_OUTLINE_COLOR } from '@/assets/config';

// {props.isDark ? SVG_OUTLINE_COLOR.DARK : SVG_OUTLINE_COLOR.LIGHT}
// {props.isDark ? SVG_FILLED_COLOR.DARK : SVG_FILLED_COLOR.LIGHT}
// {props.isDark ? SVG_FILLED_BACKGROUND.DARK : SVG_FILLED_BACKGROUND.LIGHT}

const Setting = (
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
      d="M18.284 43.171a19.995 19.995 0 0 1-8.696-5.304 6 6 0 0 0-5.182-9.838A20.09 20.09 0 0 1 4 24c0-2.09.32-4.106.916-6H5a6 6 0 0 0 5.385-8.65 19.968 19.968 0 0 1 8.267-4.627A6 6 0 0 0 24 8a6 6 0 0 0 5.348-3.277 19.968 19.968 0 0 1 8.267 4.627A6 6 0 0 0 43.084 18c.595 1.894.916 3.91.916 6 0 1.38-.14 2.728-.406 4.03a6 6 0 0 0-5.182 9.838 19.995 19.995 0 0 1-8.696 5.303 6.003 6.003 0 0 0-11.432 0Z"
      stroke={props.isDark ? SVG_OUTLINE_COLOR.DARK : SVG_OUTLINE_COLOR.LIGHT}
      strokeWidth={4}
      strokeLinejoin="round"
    />
    <path
      d="M24 31a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z"
      stroke={props.isDark ? SVG_OUTLINE_COLOR.DARK : SVG_OUTLINE_COLOR.LIGHT}
      strokeWidth={4}
      strokeLinejoin="round"
    />
  </svg>
);

export default Setting;
