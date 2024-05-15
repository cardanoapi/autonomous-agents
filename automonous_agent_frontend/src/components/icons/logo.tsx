import React from 'react';

const Logo: React.FC = () => {
  return (
    <svg width="65" height="65" viewBox="0 0 65 65" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32.4999" cy="32.4996" rx="10.8188" ry="35.143" transform="rotate(-45 32.4999 32.4996)" stroke="url(#paint0_linear_2136_51561)" strokeWidth="4.22937"/>
      <ellipse cx="32.4999" cy="32.4999" rx="10.8188" ry="35.143" transform="rotate(45 32.4999 32.4999)" stroke="url(#paint1_linear_2136_51561)" strokeWidth="4.22937"/>
      <defs>
        <linearGradient id="paint0_linear_2136_51561" x1="32.4999" y1="-2.64336" x2="32.4999" y2="67.6426" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2562E4"/>
          <stop offset="0.5" stopColor="#9552B0"/>
          <stop offset="1" stopColor="#F13A80"/>
        </linearGradient>
        <linearGradient id="paint1_linear_2136_51561" x1="31.793" y1="-1.44124" x2="32.4999" y2="67.6428" gradientUnits="userSpaceOnUse">
          <stop offset="0.1" stopColor="#8856B9"/>
          <stop offset="0.3" stopColor="#E83D7E"/>
          <stop offset="0.6" stopColor="#1B62E6"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

export default Logo;
