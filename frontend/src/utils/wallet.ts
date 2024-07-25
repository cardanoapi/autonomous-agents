import { CIP30Instance, CIP30Provider } from 'kuber-client/types';

export async function getStakeAddress(wallet: CIP30Instance) {
    const reward_address = await wallet.getRewardAddresses();
    if (reward_address.length > 0) {
        return reward_address[0];
    }
    return false;
}

export function listProviders(): CIP30Provider[] {
    const pluginMap = new Map();
    //@ts-ignore
    if (!window.cardano) {
        return [];
    }
    //@ts-ignore
    Object.keys(window.cardano).forEach((x) => {
        //@ts-ignore
        const plugin: CIP30Provider = window.cardano[x];
        //@ts-ignore
        if (plugin.enable && plugin.name) {
            pluginMap.set(plugin.name, plugin);
        }
    });
    const providers = Array.from(pluginMap.values());
    // yoroi doesn't work (remove this after yoroi works)
    return providers.filter((x) => x.name != 'yoroi');
}
