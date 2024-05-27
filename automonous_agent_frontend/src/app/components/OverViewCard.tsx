import { Card } from '@app/components/atoms/Card';
import PropTypes from 'prop-types';
import React from 'react';

export interface IOverViewCard {
    title?: string;
    value?: number | string;
    children?: React.ReactNode;
}

const OverViewCard: React.FC<IOverViewCard> = ({ title, value, children }) => {
    return (
        <Card className="hover-transition-primary flex h-full w-full min-w-[269px] flex-col justify-between gap-y-0 p-4 pb-6">
            <div className="flex flex-col gap-y-2">
                <div className="h4">{title}</div>
                <div className="card-h1 pl-[2px]">{value}</div>
            </div>
            {children}
        </Card>
    );
};

OverViewCard.propTypes = {
    title: PropTypes.string,
    value: PropTypes.number,
    children: PropTypes.node,
};

OverViewCard.defaultProps = {
    title: '',
    value: 0,
    children: null,
};

export default OverViewCard;
