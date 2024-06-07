import PropTypes from 'prop-types';

function PolygonIcon({ width = 12, height = 12, className = '' }: IPolygonIcon) {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 12 9"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path
                id="Polygon 3"
                d="M5.62859 9L0.171463 0L11.0857 0L5.62859 9Z"
                fill="black"
                fillOpacity="0.76"
            />
        </svg>
    );
}

interface IPolygonIcon {
    width?: number;
    height?: number;
    className?: string;
}

export default PolygonIcon;
