import OverViewCard from './OverViewCard';

export interface IOverViewAgentsCard {
    title: string;
    totalAgents: number | string;
    activeAgents: number;
    inactiveAgents: number | string;
}

export default function OverViewAgentsCard({
    title,
    totalAgents,
    activeAgents,
    inactiveAgents
}: IOverViewAgentsCard) {
    return (
        <OverViewCard title={title} value={totalAgents}>
            <div className="flex w-full items-center gap-x-8 overflow-x-clip 4xl:gap-x-16">
                <div className="flex w-32 items-center gap-x-2 sm:w-fit">
                    <ActiveBall />
                    <div className="card-h4 !text-brand-Green-200">
                        {activeAgents} Running
                    </div>
                </div>
                <div className="flex items-center gap-x-1">
                    <InactiveBall />
                    <div className="card-h4">{inactiveAgents} Inactive</div>
                </div>
            </div>
        </OverViewCard>
    );
}
const ActiveBall = () => {
    return (
        <div className="flex h-4 w-4 items-center  justify-center rounded-full bg-brand-Green-100">
            <div className="h-1  w-1 animate-ping rounded-full bg-brand-Green-200"></div>
        </div>
    );
};

const InactiveBall = () => {
    return (
        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-Inactive-100 opacity-50">
            <div className="h-2 w-2 rounded-full bg-brand-Gray-200"></div>
        </div>
    );
};
