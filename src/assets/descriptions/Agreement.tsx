import * as React from 'react';
import { SVG_OUTLINE_COLOR } from '@/assets/config';

// {props.isDark ? SVG_OUTLINE_COLOR.DARK : SVG_OUTLINE_COLOR.LIGHT}
// {props.isDark ? SVG_FILLED_COLOR.DARK : SVG_FILLED_COLOR.LIGHT}
// {props.isDark ? SVG_FILLED_BACKGROUND.DARK : SVG_FILLED_BACKGROUND.LIGHT}

const Agreement = (
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
    <rect
      x={8}
      y={4}
      width={32}
      height={40}
      rx={2}
      stroke={props.isDark ? SVG_OUTLINE_COLOR.DARK : SVG_OUTLINE_COLOR.LIGHT}
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 4h9v16l-4.5-4-4.5 4V4Z"
      stroke={props.isDark ? SVG_OUTLINE_COLOR.DARK : SVG_OUTLINE_COLOR.LIGHT}
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 28h10M16 34h16"
      stroke={props.isDark ? SVG_OUTLINE_COLOR.DARK : SVG_OUTLINE_COLOR.LIGHT}
      strokeWidth={4}
      strokeLinecap="round"
    />
  </svg>
);

export default Agreement;
