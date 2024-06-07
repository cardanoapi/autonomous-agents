export interface IOverViewCardTitle {
    title: string;
    value: number | string;
}

export default function OverViewCardTitle({ title, value }: IOverViewCardTitle) {
    return (
        <div className="flex flex-col gap-y-2">
            <div className="h4">{title}</div>
            <div className="card-h1 pl-[2px]">{value}</div>
        </div>
    );
}
