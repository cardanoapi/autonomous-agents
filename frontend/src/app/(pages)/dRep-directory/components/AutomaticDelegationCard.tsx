'use client';

import { useMemo } from 'react';

import { TypographyH2 } from '@typography';
import { convertLovelaceToAda } from '@utils';

import { Badge } from '@app/components/atoms/Badge';
import { Button } from '@app/components/atoms/Button';

interface AutomaticDelegationCardProps {
    title: string;
    description: string;
    votingPower: number;
}

const AutomaticDelegationCard: React.FC<AutomaticDelegationCardProps> = ({
    title,
    description,
    votingPower
}: AutomaticDelegationCardProps) => {
    const formattedVotingPower = useMemo(() => {
        return convertLovelaceToAda(votingPower).toLocaleString('en-Us');
    }, [votingPower]);

    return (
        <div
            className={`flex w-full items-center justify-between rounded-xl border bg-white/60 p-4 shadow-md`}
        >
            <div className="flex flex-col space-y-2">
                <TypographyH2 className="font-semibold">{title}</TypographyH2>
                <p className="!w-3/4 text-sm">{description}</p>
            </div>

            <div className="flex items-center space-x-4">
                <div className="flex w-32 flex-col items-center space-y-2">
                    <p className="text-sm text-gray-800">Voting Power</p>
                    <p className="font-semibold">₳ {formattedVotingPower}</p>
                </div>

                <div className="flex w-32 flex-col items-center space-y-2">
                    <p className="text-sm text-gray-800">Status</p>
                    <Badge className="text-blue-800" variant="outline">
                        Info
                    </Badge>
                </div>

                <Button className="rounded-3xl bg-blue-900">Delegate</Button>
            </div>
        </div>
    );
};

export default AutomaticDelegationCard;
