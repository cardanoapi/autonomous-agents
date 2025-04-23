import Link from 'next/link';

import Logo from '@app/assets/icons/Logo';
import { Badge } from '@app/components/atoms/Badge';
import environments from '@app/configs/environments';

const networkName = environments.network.charAt(0).toUpperCase() + environments.network.slice(1);
export default function SideNavLogo({ renderLogo = true }: { renderLogo?: boolean }) {
    return (
        <div className="flex flex-col gap-4 py-8 pb-2 pl-3 max-md:flex-row">
            <Link href="/" className="flex flex-row items-center gap-x-2   ">
                <div className="flex gap-2">
                    {renderLogo && <Logo height={48} width={48} />}
                    <div>
                        <span className="h3 !bg-gradient-to-t from-zinc-500 to-zinc-900 !bg-clip-text !font-medium !text-transparent">
                            Autonomous
                        </span>
                        <br />
                        <span className="h2 !bg-gradient-to-t from-zinc-500 to-zinc-900 !bg-clip-text !font-semibold !text-transparent">
                            Agent Testing
                        </span>
                    </div>
                </div>
            </Link>
            <Badge
                className="w-24 border border-gray-400 text-xs font-medium text-brand-Blue-200 max-md:h-8"
                variant={'outline'}
            >
                {networkName}
            </Badge>
        </div>
    );
}
