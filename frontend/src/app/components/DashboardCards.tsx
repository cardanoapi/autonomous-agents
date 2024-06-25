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
    const { data: infoActionProposalsHistory = [] } = useQuery({
        queryKey: ['infoActionProposalsHistory'],
        queryFn: () => fetchTriggerHistoryByFunctionName('Info Action Proposal')
    });
    const { data: proposalNewConstitutionsHistory = [] } = useQuery({
        queryKey: ['propsalNewConstitutionHistory'],
        queryFn: () => fetchTriggerHistoryByFunctionName('Proposal New Constitution')
    });
    const { data: votesHistory = [] } = useQuery({
        queryKey: ['votesHistory'],
        queryFn: () => fetchTriggerHistoryByFunctionName('Vote')
    });

    const [proposalChangeRate, setProposalChangeRate] = useState(0);
    const [voteChangeRate, setVoteChangeRate] = useState(0);
    const [proposalGraphData, setProposalGraphData] =
        useState<ILineChartData[]>(graphDataPlaceholder);
    const [voteGrpahData, setVoteGraphData] =
        useState<ILineChartData[]>(graphDataPlaceholder);

    useEffect(() => {
        if (infoActionProposalsHistory.length !== 0) {
            const accumulatedData = accumulateSuccessfullTriggersforLast24Hours(
                infoActionProposalsHistory.items,
                4
            );
            setProposalGraphData(formatArrayIntoChartData(accumulatedData));
            const changeRate = calculateTriggerChangeRateforLast24Hours(
                infoActionProposalsHistory.items
            );
            setProposalChangeRate(changeRate);
        }
    }, [infoActionProposalsHistory]);

    useEffect(() => {
        if (votesHistory.length !== 0) {
            const accumulatedData = accumulateSuccessfullTriggersforLast24Hours(
                votesHistory.items,
                4
            );
            setVoteGraphData(formatArrayIntoChartData(accumulatedData));
            const changeRate = calculateTriggerChangeRateforLast24Hours(
                votesHistory.items
            );
            setVoteChangeRate(changeRate);
        }
    }, [votesHistory]);

    //todo : Add Proposal with Info action for Card Data.

    /*//For Testing with More Data
    const { data: sendAdaHistory = [] } = useQuery({
        queryKey: ['sendAdaHistory'],
        queryFn: () => fetchTriggerHistoryByFunctionName('SendAda Token')
    });

    useEffect(()=>{
        if (sendAdaHistory.length !== 0){
            const accumulatedData = accumulateSuccessfullTriggersforLast24Hours(sendAdaHistory.items , 4)
            setVoteGraphData(formatArrayIntoChartData(accumulatedData))
        }
    })*/

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
                    filterSuccessTriggers(proposalNewConstitutionsHistory?.items || [])
                        .length +
                    filterSuccessTriggers(infoActionProposalsHistory?.items || [])
                        .length
                }
                changeRate={proposalChangeRate}
                graphData={proposalGraphData}
            />
            <OverViewGraphCard
                title="No of Votes"
                totalValue={filterSuccessTriggers(votesHistory?.items || []).length}
                changeRate={voteChangeRate || 0}
                theme="Secondary"
                graphData={voteGrpahData}
            />
        </div>
    );
};

export default DashboardCards;
