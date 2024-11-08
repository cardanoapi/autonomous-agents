import React from 'react';

interface LogoProps {
    height?: number;
    width?: number;
}

const Logo: React.FC<LogoProps> = ({ height = 65, width = 65 }) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 65 65"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            st
            <ellipse
                cx="32.4999"
                cy="32.4996"
                rx="10.8188"
                ry="35.143"
                transform="rotate(-45 32.4999 32.4996)"
                stroke="url(#paint0_linear_2136_51472)"
                strokeWidth="4.22937"
            />
            <ellipse
                cx="32.4999"
                cy="32.4999"
                rx="10.8188"
                ry="35.143"
                transform="rotate(45 32.4999 32.4999)"
                stroke="url(#paint1_linear_2136_51472)"
                strokeWidth="4.22937"
            />
            <path
                d="M31.9799 23.1543C32.4195 22.9349 32.9531 23.4505 32.7119 23.8763C32.5809 24.2148 32.0697 24.2994 31.7965 24.0363C31.5257 23.7836 31.6219 23.2847 31.9878 23.1452L31.9799 23.1543ZM27.2711 23.5971C27.5455 23.4931 27.8711 23.7295 27.8422 24.0064C27.8652 24.3099 27.4802 24.5377 27.2084 24.3827C26.8531 24.2463 26.9031 23.6832 27.2711 23.5971ZM36.9075 24.4918C36.4889 24.4329 36.4302 23.8075 36.8246 23.6865C37.1462 23.5466 37.4259 23.8176 37.4698 24.1044C37.4023 24.3445 37.1918 24.5663 36.9075 24.4918ZM28.3188 25.5303C28.7692 25.2668 29.3964 25.6741 29.3185 26.1653C29.2951 26.6754 28.6075 26.9625 28.2166 26.6188C27.8366 26.3468 27.9067 25.7305 28.3188 25.5303ZM35.1034 25.8936C35.3088 25.4049 36.1134 25.3949 36.3363 25.871C36.5525 26.2481 36.2731 26.7099 35.871 26.8308C35.3494 26.9153 34.8525 26.3739 35.1034 25.8936ZM31.377 26.7499C31.3813 26.3295 31.7854 26.0212 32.2061 25.9982C32.4788 26.0543 32.7809 26.1732 32.8966 26.4439C33.1116 26.8118 32.9138 27.3188 32.511 27.4943C32.3279 27.581 32.1083 27.5423 31.908 27.5324C31.6075 27.3862 31.3553 27.0972 31.3769 26.759L31.377 26.7499ZM24.3735 27.3034C24.7782 27.0668 25.3216 27.511 25.1611 27.9376C25.0755 28.2934 24.5624 28.4404 24.2732 28.2058C23.9644 27.9788 24.0153 27.4521 24.3735 27.3034ZM39.4078 27.4565C39.758 27.1932 40.3211 27.5022 40.2714 27.913C40.2948 28.2973 39.8089 28.5878 39.4634 28.3864C39.0903 28.2134 39.049 27.6676 39.4078 27.4565ZM33.3348 28.1548C33.6221 28.0653 33.9279 28.0698 34.212 28.1677C34.4948 28.2656 34.7376 28.4516 34.9017 28.698C35.3161 29.2918 35.0869 30.2007 34.417 30.5336C33.7269 30.9379 32.7257 30.5789 32.478 29.8435C32.1932 29.1794 32.6208 28.3532 33.3361 28.1548M30.0022 28.1834C30.6351 27.9035 31.4825 28.1542 31.7769 28.7742C32.1364 29.3845 31.8455 30.2224 31.2032 30.5283C30.5592 30.8784 29.6483 30.6009 29.3542 29.9458C29.004 29.3174 29.3238 28.4616 30.0022 28.1834ZM26.6486 29.2479C26.6982 28.8566 27.0847 28.6093 27.4767 28.5873C27.6744 28.6073 27.8593 28.6942 28.0009 28.8336C28.1424 28.9731 28.2321 29.1567 28.2551 29.3541C28.2224 29.7559 27.8994 30.1549 27.4608 30.1504C26.9658 30.1818 26.5516 29.7025 26.6486 29.2479ZM36.5191 28.7587C37.0242 28.497 37.7048 28.9048 37.681 29.45C37.7114 30.04 36.9406 30.4448 36.4508 30.0987C35.9331 29.8071 35.9777 29.0044 36.5191 28.7587ZM28.6146 30.7427C28.9069 30.6715 29.2138 30.6954 29.4899 30.8115C29.766 30.9263 29.9943 31.129 30.1427 31.3844C30.2928 31.6483 30.3433 31.9572 30.2851 32.2551C30.2269 32.5531 30.0639 32.8203 29.8255 33.0083C29.1976 33.5642 28.0494 33.3208 27.7292 32.5574C27.3523 31.8558 27.8187 30.9221 28.6146 30.7427ZM34.9453 30.8071C35.5131 30.6528 36.1774 30.8731 36.4743 31.3694C36.8798 31.9437 36.6693 32.8007 36.0722 33.1512C35.4287 33.5743 34.4627 33.3405 34.122 32.6667C33.7086 31.9752 34.1389 31.0046 34.9454 30.798L34.9453 30.8071ZM24.8453 31.3396C25.3495 31.1664 25.9011 31.707 25.6958 32.1878C25.5625 32.6251 24.9218 32.7787 24.5972 32.4448C24.2071 32.1453 24.3598 31.4687 24.8453 31.3396ZM38.5123 32.1842C38.5086 32.0861 38.5245 31.9882 38.5589 31.8963C38.5934 31.8044 38.6457 31.7202 38.713 31.6486C38.8512 31.5025 39.0405 31.4154 39.2413 31.4054C39.5792 31.4622 39.9149 31.7338 39.8838 32.1005C39.9141 32.5746 39.3081 32.8991 38.8901 32.6632C38.6906 32.57 38.5936 32.3738 38.5123 32.1842ZM22.3582 31.5551C22.6705 31.4333 23.0428 31.687 22.9654 32.0077C22.9434 32.3746 22.3849 32.5121 22.1784 32.2067C21.9984 31.9901 22.111 31.6684 22.3673 31.5552L22.3582 31.5551ZM41.495 31.7498C41.7152 31.6011 42.0512 31.7034 42.1308 31.9438C42.2752 32.2134 42.0073 32.5686 41.7058 32.52C41.2759 32.5521 41.1365 31.9245 41.495 31.7407L41.495 31.7498ZM30.2317 33.3873C31.0289 33.1988 31.8801 33.8505 31.8825 34.6368C31.9199 35.4416 31.0731 36.1489 30.2524 35.9531C29.9425 35.8955 29.6625 35.7315 29.4605 35.4895C29.2614 35.2503 29.1546 34.9476 29.1594 34.6364C29.1653 34.0546 29.6291 33.5061 30.2329 33.3964L30.2317 33.3873ZM33.3932 33.4195C34.2075 33.213 35.0781 33.874 35.0607 34.6874C35.0984 35.4649 34.2701 36.145 33.4674 35.9767C32.7199 35.8793 32.1696 35.0784 32.3877 34.3738C32.5017 33.9102 32.9078 33.5304 33.3932 33.4195ZM27.2865 33.8481C27.8536 33.764 28.3772 34.3694 28.1351 34.8759C27.9643 35.4196 27.1402 35.5635 26.779 35.112C26.3538 34.6781 26.6833 33.8953 27.2865 33.8481ZM36.5663 33.9698C37.0617 33.7692 37.6782 34.1959 37.6274 34.7135C37.6489 35.2864 36.8873 35.6809 36.3975 35.3349C35.8526 35.026 35.9527 34.1432 36.5663 33.9698ZM39.1257 36.499C38.938 36.1392 39.2981 35.6781 39.6996 35.7447C39.9014 35.7467 40.0456 35.9005 40.1718 36.0359C40.197 36.2418 40.2401 36.483 40.0562 36.6504C39.8059 36.9433 39.2601 36.8493 39.1257 36.499ZM24.2804 35.6841C24.6577 35.4471 25.1928 35.8183 25.1052 36.2392C25.0571 36.6227 24.5603 36.8324 24.2423 36.6144C23.8981 36.413 23.9115 35.86 24.2804 35.6841ZM31.7537 36.5555C32.2491 36.3457 32.8748 36.7725 32.824 37.2914C32.8545 37.871 32.0734 38.2665 31.5941 37.9128C31.0478 37.6118 31.1479 36.7289 31.7537 36.5555ZM28.2745 37.2985C28.7062 37.0881 29.2686 37.4609 29.2184 37.916C29.2328 38.291 28.8456 38.6086 28.4714 38.5423C28.1525 38.539 27.9445 38.2597 27.8469 37.9996C27.8498 37.7133 27.9819 37.4022 28.2837 37.2895L28.2745 37.2985ZM35.3081 37.3701C35.7403 37.1141 36.3481 37.4978 36.3055 37.979C36.3093 38.4971 35.6123 38.8115 35.2044 38.4767C35.117 38.4098 35.0479 38.3217 35.0038 38.2208C34.9597 38.1198 34.9419 38.0093 34.9521 37.8997C34.9624 37.79 35.0002 37.6847 35.0623 37.5937C35.1243 37.5026 35.2084 37.4288 35.3067 37.3792L35.3081 37.3701ZM36.4929 40.2862C36.3043 40.0161 36.5356 39.6696 36.8473 39.6116C37.1019 39.6663 37.3656 39.8486 37.2977 40.1239C37.2677 40.5089 36.69 40.6188 36.4928 40.2953L36.4929 40.2862ZM26.804 39.9468C26.8791 39.7249 27.0636 39.5029 27.3376 39.5669C27.7395 39.5983 27.8521 40.18 27.5027 40.3561C27.1818 40.5481 26.828 40.2685 26.804 39.9468ZM31.4778 40.2534C31.5541 39.9235 32.0034 39.768 32.2945 39.9493C32.4759 40.0318 32.5389 40.2381 32.5813 40.4169L32.5057 40.683C32.3858 40.8249 32.2295 40.9574 32.037 40.9464C31.663 40.9881 31.3287 40.5825 31.4778 40.2534Z"
                fill="url(#paint2_linear_2136_51472)"
            />
            <defs>
                <linearGradient
                    id="paint0_linear_2136_51472"
                    x1="32.4999"
                    y1="-2.64336"
                    x2="32.4999"
                    y2="67.6426"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#2562E4" />
                    <stop offset="0.5" stopColor="#9552B0" />
                    <stop offset="1" stopColor="#F13A80" />
                </linearGradient>
                <linearGradient
                    id="paint1_linear_2136_51472"
                    x1="31.793"
                    y1="-1.44124"
                    x2="32.4999"
                    y2="67.6428"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0.1" stopColor="#8856B9" />
                    <stop offset="0.3" stopColor="#E83D7E" />
                    <stop offset="0.6" stopColor="#1B62E6" />
                </linearGradient>
                <linearGradient
                    id="paint2_linear_2136_51472"
                    x1="32.2216"
                    y1="23.1022"
                    x2="32.04"
                    y2="40.9499"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#4F5DD4" />
                    <stop offset="1" stopColor="#F13C7F" />
                </linearGradient>
            </defs>
        </svg>
    );
};

export default Logo;
