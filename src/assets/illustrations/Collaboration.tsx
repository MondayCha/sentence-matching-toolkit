import * as React from 'react';
import { SVG_FILLED_COLOR } from '@/assets/config';

// {props.theme == 'dark' ? SVG_OUTLINE_COLOR.DARK : SVG_OUTLINE_COLOR.LIGHT}
// {props.theme == 'dark' ? SVG_FILLED_COLOR.DARK : SVG_FILLED_COLOR.LIGHT}
// {props.theme == 'dark' ? SVG_FILLED_BACKGROUND.DARK : SVG_FILLED_BACKGROUND.LIGHT}

const Collaboration = (
  props: JSX.IntrinsicAttributes &
    React.SVGProps<SVGSVGElement> & {
      theme?: string;
    }
) => (
  <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M300.754 22H71.461v165.292h229.293V22Z"
      stroke="#DEDFEA"
      strokeWidth={0.882}
      strokeMiterlimit={10}
    />
    <path
      d="M324.645 60.964H177.248v145.017h147.397V60.964Z"
      stroke="#DEDFEA"
      strokeWidth={0.882}
      strokeMiterlimit={10}
    />
    <path
      d="m223.618 263.371 5.465-26.535h-22.127l-5.554 26.535h22.216Z"
      fill="#FFC7DE"
      stroke="#000"
      strokeWidth={0.882}
      strokeMiterlimit={10}
    />
    <path
      d="m251.474 153.352-21.863 105.347h-28.474l18.512-105.347h31.825Z"
      fill="#DEDFEA"
      stroke="#000"
      strokeWidth={0.882}
      strokeMiterlimit={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="m201.402 263.371-17.279 9.08c-1.146.617-1.939 1.851-1.939 3.173v.618c0 .528.44.969.969.969h41.522c.529 0 .969-.529.881-1.058l-1.939-12.694h-22.215v-.088Z"
      fill="#B6BBE2"
      stroke="#000"
      strokeWidth={0.882}
      strokeMiterlimit={10}
    />
    <path d="M182.271 275.625h43.197" stroke="#000" strokeWidth={0.441} strokeMiterlimit={10} />
    <path d="m224.41 261.255-22.039-1.939v-.617l22.304.176-.265 2.38Z" fill="#000" />
    <path
      d="m290.704 244.417-19.483-17.014-13.84 14.811 16.573 16.837 16.75-14.634Z"
      fill="#FFC7DE"
      stroke="#000"
      strokeWidth={0.882}
      strokeMiterlimit={10}
    />
    <path
      d="m242.218 200.428-3.702-3.262 7.934-46.458-21.334-5.907-8.375 54.128c-1.058 5.818.882 11.813 5.113 15.956l13.929 13.4"
      fill="#000"
    />
    <path
      d="m225.202 140.217-8.375 54.128c-1.058 5.818.882 11.812 5.113 15.956l41.081 39.494 17.631-19.747-35.174-34.469 7.934-46.458"
      fill="#DEDFEA"
    />
    <path
      d="m225.202 140.217-8.375 54.128c-1.058 5.818.882 11.812 5.113 15.956l41.081 39.494 17.631-19.747-35.174-34.469 7.934-46.458"
      stroke="#000"
      strokeWidth={0.882}
      strokeMiterlimit={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="m270.692 256.142-1.852 13.047-3.085 2.204c-1.411 1.058-2.292 2.645-2.292 4.408v.441a.79.79 0 0 0 .793.793h7.141c.529 0 1.058-.264 1.41-.617l23.714-26.711c.265-.353.265-.882-.088-1.146l-11.372-9.257-14.369 16.838Z"
      fill="#B6BBE2"
      stroke="#000"
      strokeWidth={0.882}
      strokeMiterlimit={10}
    />
    <path
      d="M263.553 275.889h7.405c.617 0 1.146-.264 1.587-.705l23.625-26.8"
      stroke="#000"
      strokeWidth={0.441}
      strokeMiterlimit={10}
    />
    <path
      d="m177.334 151.324 12.43-8.551s1.852-3.174 2.91-3.702c1.234-.618 5.377-.529 5.377-.529l26.447-20.188c1.587-1.058 4.055 19.659 2.468 20.717 0 0-26.006 24.683-37.907 26.094-2.645.352-3.967-1.234-3.526-3.086 0 0-2.821.794-4.584-1.058-1.234-1.322-.617-3.614-.617-3.614-.617.088-2.821 0-3.527-1.763-.881-2.38.529-4.32.529-4.32Z"
      fill="#FFC7DE"
      stroke="#000"
      strokeWidth={0.882}
      strokeMiterlimit={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="m184.741 135.456 5.025.97c1.675.353 3.35 1.146 4.319 2.469l4.585 6.082c1.146 1.587.793 3.791-.882 4.849-4.584 2.204-8.639-5.466-8.639-5.466l-11.901 6.964-32.971-32 5.819-27.593 34.645 43.725Zm95.382 5.202 4.937 6.611s4.937 6.612 6.876 9.874c1.675 2.732-1.058 3.614-1.939 2.997 0 0 1.939 2.556.352 4.055-1.146 1.058-2.732.794-3.614-.264 0 0 .97 1.675-.793 2.821-1.235.793-2.645.176-3.615-.882-1.851-2.116-6.171-7.493-6.171-7.493s.177 3.79.265 5.818c.088 2.909-3.262 3.438-4.055.794-.794-2.381-1.764-10.932-1.764-10.932l-2.909-3.526 12.43-9.873Z"
      fill="#FFC7DE"
      stroke="#000"
      strokeWidth={0.882}
      strokeMiterlimit={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="m290.087 160.14-6.083-8.11m2.819 11.901-6.171-7.846m-4.406 2.204s3.791-1.675 2.292-6.7"
      stroke="#000"
      strokeWidth={0.882}
      strokeMiterlimit={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="m275.107 184.953 32.897-17.559-12.578-23.565-32.898 17.56 12.579 23.564Z"
      fill="#fff"
      stroke="#000"
      strokeWidth={0.882}
      strokeMiterlimit={10}
    />
    <path
      d="m275.518 180.459 27.609-14.737-9.091-17.032-27.609 14.737 9.091 17.032Z"
      fill="#DEDFEA"
    />
    <path
      d="m269.556 181.246 5.833-3.114-7.057-13.221-5.833 3.114 7.057 13.221Z"
      fill="#B6BBE2"
      stroke="#000"
      strokeWidth={0.882}
      strokeMiterlimit={10}
    />
    <path
      d="m280.125 140.658 5.818 7.757-7.228 4.055c.617 4.056-2.469 5.819-2.469 5.819s.177 3.79.265 5.818c.088 2.909-3.262 3.438-4.055.793-.794-2.38-1.764-10.931-1.764-10.931l-2.909-3.526 12.342-9.785Z"
      fill="#FFC7DE"
      stroke="#000"
      strokeWidth={0.882}
      strokeMiterlimit={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M276.246 158.289s3.791-1.675 2.292-6.7"
      stroke="#000"
      strokeWidth={0.882}
      strokeMiterlimit={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="m116.773 263.37 3.439-25.653h22.215l-3.35 25.653h-22.304Zm-36.585-18.953 19.482-17.014 16.661 14.634-19.394 17.014-16.75-14.634Z"
      fill="#FFC7DE"
      stroke="#000"
      strokeWidth={0.882}
      strokeMiterlimit={10}
    />
    <path
      d="m229.699 104.426 36.938 48.573 16.132-12.518-37.554-50.513-15.516 14.458Z"
      fill={props.theme == 'dark' ? SVG_FILLED_COLOR.DARK : SVG_FILLED_COLOR.LIGHT}
      stroke="#000"
      strokeWidth={0.882}
      strokeMiterlimit={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="m232.52 104.954 22.215 27.77-1.234-32.442-8.287-10.314-12.694 14.986Z" fill="#000" />
    <path
      d="m149.215 140.217 9.256 54.128c1.058 5.818-.881 11.812-5.113 15.956l-44.607 43.02-17.983-18.689 34.116-35.527-3.086-42.579"
      fill="#DEDFEA"
    />
    <path
      d="m149.215 140.217 9.256 54.128c1.058 5.818-.881 11.812-5.113 15.956l-44.607 43.02-17.983-18.689 34.116-35.527-3.086-42.579"
      stroke="#000"
      strokeWidth={0.882}
      strokeMiterlimit={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="m118.975 157.848 5.73 42.227-8.463 58.623h25.83l9.873-53.51c.529-3.438.706-6.876.441-10.314l-1.587-37.026h-31.824Z"
      fill="#DEDFEA"
      stroke="#000"
      strokeWidth={0.882}
      strokeMiterlimit={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M232.344 79.125c7.157 0 12.959-5.802 12.959-12.959s-5.802-12.959-12.959-12.959-12.959 5.802-12.959 12.959 5.802 12.959 12.959 12.959Z"
      fill="#FFC7DE"
      stroke="#000"
      strokeWidth={0.882}
      strokeMiterlimit={10}
    />
    <path
      d="M237.368 54.089c2.292.793 9.785 5.553 7.493 15.515-.969 4.144-4.231 6.171-4.231 6.171-4.937-1.675-4.937-8.816-5.378-8.816-2.733.441-5.377-1.85-7.052-5.377-1.851-3.79-.882-7.581-.882-7.581 1.411-.353 4.496-1.764 10.05.088Z"
      fill="#000"
    />
    <path d="M236.663 71.72a3.703 3.703 0 1 0 0-7.406 3.703 3.703 0 0 0 0 7.406Z" fill="#FFC7DE" />
    <path
      d="M222.646 57.88s4.761-.882 6.524-2.469l-1.499-1.322c0 .088-3.79 1.675-5.025 3.79Z"
      fill="#000"
    />
    <path
      d="m238.427 67.488-2.997.53"
      stroke="#000"
      strokeWidth={0.882}
      strokeMiterlimit={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="m152.122 126.376 15.868-13.223s-13.311-17.014-21.51-25.39c-3.261-3.349-8.815-4.142-11.46-4.142 0 0 .794 10.138-1.322 11.107-7.317 3.174 18.424 31.648 18.424 31.648Zm67.351 27.152h37.907s-4.673-33.235-5.819-44.871c-.617-6.083-1.763-11.196-4.055-15.251-3.967-7.229-11.813-11.99-19.57-9.257-6.965 2.469-11.461 9.169-11.108 16.486l2.645 52.893Z"
      fill={props.theme == 'dark' ? SVG_FILLED_COLOR.DARK : SVG_FILLED_COLOR.LIGHT}
      stroke="#000"
      strokeWidth={0.882}
      strokeMiterlimit={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="m139.076 263.371 17.279 9.08c1.146.617 1.939 1.851 1.939 3.174v.617a.978.978 0 0 1-.97.969h-41.521c-.529 0-.97-.529-.882-1.058l1.94-12.694h22.215v-.088Zm-38.876-7.229 1.851 13.047 3.086 2.204c1.41 1.058 2.292 2.645 2.292 4.408v.44a.79.79 0 0 1-.794.794h-7.14c-.53 0-1.058-.265-1.41-.617L74.37 249.706c-.264-.352-.264-.881.088-1.146l12.166-9.609 13.576 17.191Z"
      fill="#B6BBE2"
      stroke="#000"
      strokeWidth={0.882}
      strokeMiterlimit={10}
    />
    <path
      d="m248.742 72.954 25.918 9.521c4.849 1.763 6.7 7.581 3.791 11.901-2.998 4.408-9.521 4.672-12.783.44l-16.926-21.862Zm-129.414 86.304 2.645.617 30.061 1.852.441-2.292-33.147-.177Z"
      fill="#000"
    />
    <path
      d="M158.204 275.624H114.92m-7.582.265h-7.405c-.617 0-1.146-.264-1.587-.705l-23.625-26.8"
      stroke="#000"
      strokeWidth={0.441}
      strokeMiterlimit={10}
    />
    <path
      d="m117.389 259.933 22.303-.617v-.617h-22.127l-.176 1.234Zm151.187-108.785 13.135-8.199-.793-.881-12.342 9.08Z"
      fill="#000"
    />
    <path
      d="M68.816 277.123h246.308m18.776 0h6.7"
      stroke="#000"
      strokeWidth={0.882}
      strokeMiterlimit={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M135.107 83.62c-9.961 0-18.072 8.11-18.072 18.072v57.654h36.056v-57.742c.088-9.873-8.022-17.983-17.984-17.983Z"
      fill={props.theme == 'dark' ? SVG_FILLED_COLOR.DARK : SVG_FILLED_COLOR.LIGHT}
      stroke="#000"
      strokeWidth={0.882}
      strokeMiterlimit={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="m124.441 152.029 1.675-23.538 10.314-24.066-19.13-4.232-7.581 19.13c-1.323 3.174-2.028 6.612-2.292 10.05l-1.499 26.094s-.441 9.786.088 14.193c.529 4.232 3.438 2.733 3.879 1.587 0 0 0 4.055 2.557 4.32 1.851.176 2.997-1.323 3.173-2.909 0 0 .177 2.468 2.645 2.38 1.675-.088 2.821-1.94 2.909-3.262.264-3.262.793-11.725.793-11.725s1.499 2.909 2.821 4.937c1.852 2.821 5.466 1.146 4.673-2.027-.882-3.439-5.025-10.932-5.025-10.932Z"
      fill="#FFC7DE"
      stroke="#000"
      strokeWidth={0.882}
      strokeMiterlimit={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="m109.895 171.071-.088-10.138m5.819 11.637-.265-11.461"
      stroke="#000"
      strokeWidth={0.882}
      strokeMiterlimit={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="m140.133 104.337-9.786 22.303-21.951-9.344 10.579-23.714"
      fill={props.theme == 'dark' ? SVG_FILLED_COLOR.DARK : SVG_FILLED_COLOR.LIGHT}
    />
    <path
      d="m140.133 104.337-9.786 22.303-21.951-9.344 10.579-23.714"
      stroke="#000"
      strokeWidth={0.882}
      strokeMiterlimit={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="m110.16 118.442 16.485 8.551.794-1.322-17.279-7.229Z" fill="#000" />
    <path
      d="m218.769 99.577.705 20.276-20.716 17.631 11.548 17.014 26.183-21.334a13.992 13.992 0 0 0 4.407-9.52l-.352-25.301"
      fill={props.theme == 'dark' ? SVG_FILLED_COLOR.DARK : SVG_FILLED_COLOR.LIGHT}
    />
    <path
      d="m218.769 99.577.705 20.276-20.716 17.631 11.548 17.014 26.183-21.334a13.992 13.992 0 0 0 4.407-9.52l-.352-25.301"
      stroke="#000"
      strokeWidth={0.882}
      strokeMiterlimit={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M81.07 75.775H60v9.785h21.07v-9.785Zm258.032 39.582h-29.973v9.785h29.973v-9.785ZM95.528 57.703h-10.49v9.785h10.49v-9.785Z"
      stroke="#000"
      strokeWidth={0.882}
      strokeMiterlimit={10}
    />
    <path
      d="M141.898 78.42c7.741 0 14.016-6.276 14.016-14.018 0-7.741-6.275-14.017-14.016-14.017-7.742 0-14.017 6.276-14.017 14.017 0 7.742 6.275 14.017 14.017 14.017Z"
      fill="#FFC7DE"
      stroke="#000"
      strokeWidth={0.882}
      strokeMiterlimit={10}
    />
    <path
      d="M141.987 50.562c8.815 0 11.901 6.7 11.901 6.7s-3.262.617-8.11.881c-3.439.265.352 4.408-2.204 6.7-.265.265-2.557 0-3.967 1.763-.353.441.617 1.852.264 2.38-1.763 2.38-4.672 4.32-8.198 5.025-1.146.177-2.028-2.82-2.204-2.997-2.028-3.262-1.675-7.934-1.235-9.08 3.262-12.077 13.576-11.372 13.576-11.372h.177Z"
      fill="#000"
    />
    <path
      d="M143.662 64.843c-.265-1.675-1.675-2.909-3.438-2.909a3.537 3.537 0 0 0-3.527 3.526c0 1.763 1.411 3.262 3.086 3.438"
      fill="#FFC7DE"
    />
    <path
      d="M143.662 64.843c-.265-1.675-1.675-2.909-3.438-2.909a3.537 3.537 0 0 0-3.527 3.526c0 1.763 1.411 3.262 3.086 3.438"
      stroke="#000"
      strokeWidth={0.882}
      strokeMiterlimit={10}
    />
    <path d="m124.705 200.075-4.672 3.614-3.879 42.051 2.292-2.028 6.259-43.637Z" fill="#000" />
  </svg>
);

export default Collaboration;
