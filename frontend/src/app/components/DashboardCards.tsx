import { useEffect, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { ILineChartData } from '@app/components/molecules/chart/CustomLineChart';
import { formatArrayIntoChartData } from '@app/utils/ChartUtils';
import {
    accumulateSuccessfullTriggersforLast24Hours,
    calculateTriggerChangeRateforLast24Hours,
    filterSuccessTriggers
} from '@app/utils/TriggerHistoryUtils';

import { fetchActiveAgentsCount, fetchAgents } from '../api/agents';
import { fetchTemplates } from '../api/templates';
import { fetchTriggerHistoryByFunctionName } from '../api/triggerHistory';
import OverViewAgentsCard from './OverViewAgentsCard';
import OverViewGraphCard from './OverViewGraphCard';
import OverViewTemplatesCard from './OverViewTemplatesCard';

export const graphDataPlaceholder: ILineChartData[] = [
    { name: 'a', amt: 0 },
    { name: 'b', amt: 0 },
    { name: 'c', amt: 0 },
    { name: 'd', amt: 0 }
];

const DashboardCards = () => {
    const { data: agents = [] } = useQuery({
        queryKey: ['agents'],
        queryFn: fetchAgents
    });
    const { data: activeAgents } = useQuery({
        queryKey: ['activeAgentsCount'],
        queryFn: fetchActiveAgentsCount
    });
    const { data: templates = [] } = useQuery({
        queryKey: ['templates'],
        queryFn: fetchTemplates
    });
    const { data: infoActionProposalHistory = [] } = useQuery({
        queryKey: ['infoActionProposalHistory'],
        queryFn: () => fetchTriggerHistoryByFunctionName('Info Action Proposal')
    });
    const { data: proposalNewConstitutionHistory = [] } = useQuery({
        queryKey: ['propsalNewConstitutionHistory'],
        queryFn: () => fetchTriggerHistoryByFunctionName('Proposal New Constitution')
    });
    const { data: voteHistory = [] } = useQuery({
        queryKey: ['voteHistory'],
        queryFn: () => fetchTriggerHistoryByFunctionName('Vote')
    });

    const [proposalChangeRate, setProposalChangeRate] = useState(0);
    const [voteChangeRate, setVoteChangeRate] = useState(0);
    const [proposalGraphData, setProposalGraphData] =
        useState<ILineChartData[]>(graphDataPlaceholder);
    const [voteGrpahData, setVoteGraphData] =
        useState<ILineChartData[]>(graphDataPlaceholder);

    useEffect(() => {
        if (
            infoActionProposalHistory.length !== 0 &&
            proposalNewConstitutionHistory.length !== 0
        ) {
            const combinedProposals = proposalNewConstitutionHistory.items.concat(
                infoActionProposalHistory.items
            );
            const accumulatedData = accumulateSuccessfullTriggersforLast24Hours(
                combinedProposals,
                4
            );
            setProposalGraphData(formatArrayIntoChartData(accumulatedData));
            const changeRate =
                calculateTriggerChangeRateforLast24Hours(combinedProposals);
            setProposalChangeRate(changeRate);
        }
    }, [infoActionProposalHistory, proposalNewConstitutionHistory]);

    useEffect(() => {
        if (voteHistory.length !== 0) {
            const accumulatedData = accumulateSuccessfullTriggersforLast24Hours(
                voteHistory.items,
                4
            );
            setVoteGraphData(formatArrayIntoChartData(accumulatedData));
            const changeRate = calculateTriggerChangeRateforLast24Hours(
                voteHistory.items
            );
            setVoteChangeRate(changeRate);
        }
    }, [voteHistory]);

    /* For Testing with More Data
    const { data: sendAdaHistory = [] } = useQuery({
        queryKey: ['sendAdaHistory'],
        queryFn: () => fetchTriggerHistoryByFunctionName('SendAda Token')
    });

    useEffect(()=>{
        if (sendAdaHistory.length !== 0){
            const accumulatedData = accumulateSuccessfullTriggersforLast24Hours(sendAdaHistory.items , 4)
            setVoteGraphData(formatArrayIntoChartData(accumulatedData))
        }
    }) */

    return (
        <div className="flex h-36 w-full grid-cols-4 gap-[12px] 2xl:gap-[25px] ">
            <OverViewAgentsCard
                title="No of Agents"
                totalAgents={agents.length || 'NA'}
                activeAgents={activeAgents?.online_agents_count}
                inactiveAgents={Math.max(
                    0,
                    agents.length - activeAgents?.online_agents_count
                )}
            />
            <OverViewTemplatesCard
                title="No of Templates"
                totalTemplates={templates.length}
                defaultTemplates={templates.length}
                customTemplates={0}
            />
            <OverViewGraphCard
                title="No of Proposals"
                totalValue={
                    filterSuccessTriggers(proposalNewConstitutionHistory?.items || [])
                        .length +
                    filterSuccessTriggers(infoActionProposalHistory?.items || []).length
                }
                changeRate={proposalChangeRate}
                graphData={proposalGraphData}
            />
            <OverViewGraphCard
                title="No of Votes"
                totalValue={filterSuccessTriggers(voteHistory?.items || []).length}
                changeRate={voteChangeRate || 0}
                theme="Secondary"
                graphData={voteGrpahData}
            />
        </div>
    );
};

export default DashboardCards;
