export default function EmptyAgent() {
    return (
        <div className="flex h-20 flex-col items-center justify-center gap-2">
            <p className="text-sm">No agents are active.</p>
            <p className="text-xs text-gray-700">Please ensure at least one of your agent is active</p>
        </div>
    );
}
