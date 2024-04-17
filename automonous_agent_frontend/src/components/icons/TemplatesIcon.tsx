import React from 'react';

const TemplateIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g id="eos-icons:templates-outlined" clipPath="url(#clip0_1353_6627)">
        <path id="Vector" d="M20 0H4C3.46957 0 2.96086 0.210714 2.58579 0.585786C2.21071 0.960859 2 1.46957 2 2V22C2 22.5304 2.21071 23.0391 2.58579 23.4142C2.96086 23.7893 3.46957 24 4 24H20C20.5304 24 21.0391 23.7893 21.4142 23.4142C21.7893 23.0391 22 22.5304 22 22V2C22 1.46957 21.7893 0.960859 21.4142 0.585786C21.0391 0.210714 20.5304 0 20 0ZM20 22H4V2H20V22Z" fill="#8C8C8C"/>
        <path id="Vector_2" d="M6 4H18V6H6V4ZM6 8H13V10H6V8ZM8 20H16L12 17L8 20ZM19 19V13L14 16L19 19ZM6 13V19L10 16L6 13ZM16 12H8L12 15L16 12Z" fill="#8C8C8C"/>
      </g>
      <defs>
        <clipPath id="clip0_1353_6627">
          <rect width="24" height="24" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  );
};

export default TemplateIcon;
