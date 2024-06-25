import React from 'react';

import { getNetworkMetrics } from '@api/getNetworkMetrics';
import { QUERY_KEYS } from '@consts';
import { useQuery } from '@tanstack/react-query';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from '@app/app/components/Accordion';

import AutomaticDelegationCard from './AutomaticDelegationCard';

export default function AutomaticDelegationOptions() {
    const { data } = useQuery({
        queryKey: [QUERY_KEYS.useGetNetworkMetricsKey],
        queryFn: () => getNetworkMetrics()
    });

    return (
        <Accordion
            className="rounded-xl border border-white bg-[#2F62DC47]/10 px-4 shadow-xl "
            type="single"
            collapsible
        >
            <AccordionItem value="item-1">
                <AccordionTrigger>Automated Voting Options</AccordionTrigger>
                <AccordionContent className="space-y-4">
                    <AutomaticDelegationCard
                        title="Abstain from Every Vote"
                        description="Select this to vote ABSTAIN to every."
                        votingPower={data?.alwaysAbstainVotingPower || 0}
                    />
                    <AutomaticDelegationCard
                        title="Signal No Confidence on Every Vote"
                        description="Select this to signal no confidence in the current constitutional committee by voting NO on every proposal and voting YES to no confidence proposals"
                        votingPower={data?.alwaysNoConfidenceVotingPower || 0}
                    />
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}
