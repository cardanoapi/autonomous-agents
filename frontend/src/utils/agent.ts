import { IAgent } from '@api/agents';

export function isAgentActive({ last_active }: IAgent): boolean {
    if (!last_active) return false;

    const diffInSeconds =
        (new Date().getTime() - new Date(last_active).getTime()) / 1000;
    return diffInSeconds <= 33;
}
