import * as React from 'react';
import { SVG_OUTLINE_COLOR } from '@/assets/config';

const Addition = (
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
      d="M10 44h28a2 2 0 0 0 2-2V14H30V4H10a2 2 0 0 0-2 2v36a2 2 0 0 0 2 2ZM30 4l10 10M24 21v14M17 28h14"
      stroke={props.isDark ? SVG_OUTLINE_COLOR.DARK : SVG_OUTLINE_COLOR.LIGHT}
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default Addition;
