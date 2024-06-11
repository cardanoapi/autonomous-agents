import { useQuery } from '@tanstack/react-query';

import { ILineChartData } from '@app/components/molecules/chart/CustomLineChart';

import { fetchActiveAgentsCount, fetchAgents } from '../api/agents';
import { fetchTemplates } from '../api/templates';
import OverViewAgentsCard from './OverViewAgentsCard';
import OverViewGraphCard from './OverViewGraphCard';
import OverViewTemplatesCard from './OverViewTemplatesCard';

export const demoPropsalGraphData: ILineChartData[] = [
    { name: 'a', amt: 0 },
    { name: 'b', amt: 5 },
    { name: 'c', amt: 12 },
    { name: 'd', amt: 11 },
    { name: 'e', amt: 7 }
];

export const demoVoterGraphData: ILineChartData[] = [
    { name: 'a', amt: 0 },
    { name: 'b', amt: 4 },
    { name: 'c', amt: 10 },
    { name: 'd', amt: 12 }
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
                totalValue={6}
                changeRate={5}
                graphData={demoPropsalGraphData}
            />
            <OverViewGraphCard
                title="No of Voters"
                totalValue={5321}
                changeRate={19}
                theme="Secondary"
                graphData={demoVoterGraphData}
            />
        </div>
    );
};

export default DashboardCards;
