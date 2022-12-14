import type { FC } from 'react';
import { useState, useEffect } from 'react';
import log from '@/middleware/logger';
import clsx from 'clsx';
import { SVG_FILLED_COLOR } from '@/assets/config';

const BranchFilled = (
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
      d="M24 33V15"
      stroke={props.theme == 'dark' ? SVG_FILLED_COLOR.DARK : SVG_FILLED_COLOR.LIGHT}
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      fill={props.theme == 'dark' ? SVG_FILLED_COLOR.DARK : SVG_FILLED_COLOR.LIGHT}
      stroke={props.theme == 'dark' ? SVG_FILLED_COLOR.DARK : SVG_FILLED_COLOR.LIGHT}
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10 9h28v6H10z"
    />
    <path
      d="m8 32 6-7h19.974L40 32"
      stroke={props.theme == 'dark' ? SVG_FILLED_COLOR.DARK : SVG_FILLED_COLOR.LIGHT}
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      fill={props.theme == 'dark' ? SVG_FILLED_COLOR.DARK : SVG_FILLED_COLOR.LIGHT}
      stroke={props.theme == 'dark' ? SVG_FILLED_COLOR.DARK : SVG_FILLED_COLOR.LIGHT}
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 33h8v8H4zM20 33h8v8h-8zM36 33h8v8h-8z"
    />
  </svg>
);

export default BranchFilled;
