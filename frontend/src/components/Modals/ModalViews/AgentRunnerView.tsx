import React from 'react';

import Link from 'next/link';

import { Copy } from 'lucide-react';

import { SuccessToast } from '@app/components/molecules/CustomToasts';
import { Separator } from '@app/components/shadcn/ui/separator';
import environments from '@app/configs/environments';

const AgentRunnerModalView = ({
    agentId,
    refetchData
}: {
    agentId: string;
    refetchData?: () => void;
}) => {
    const dockerCommand = `docker run -d --pull always -e WS_URL=${environments.NEXT_PUBLIC_WS_URL} -e AGENT_ID=${agentId} cardanoapi/autonomous-agents-agent-node:${environments.NEXT_PUBLIC_IMAGE_TAG}`;
    const handleClickCopy = () => {
        navigator.clipboard.writeText(dockerCommand);
        SuccessToast('Docker Command Copied!');
        const fetchTimeOut = setTimeout(() => refetchData && refetchData(), 10000);
        return () => clearTimeout(fetchTimeOut);
    };
    return (
        <div className={'flex h-full w-full flex-col '}>
            <span className={'px-5 py-2 text-base font-medium'}>Agent Runner</span>
            <Separator />
            <div className={'flex flex-col gap-6 px-5 py-4'}>
                <span className={''}>Run this agent by following tutorial:</span>
                <div className={'flex flex-col gap-2'}>
                    <span className={'text-base font-semibold text-brand-Black-100'}>
                        Using Docker:
                    </span>
                    <div className={'flex w-full items-center gap-1'}>
                        <div
                            onClick={handleClickCopy}
                            className={
                                'w-[520px] cursor-pointer truncate rounded bg-blue-100 p-2 font-sans text-sm drop-shadow-sm hover:text-brand-Black-300/90'
                            }
                        >
                            {dockerCommand}
                        </div>
                        <Copy
                            color="#A1A1A1"
                            className=" w- h-5 hover:cursor-pointer"
                            onClick={handleClickCopy}
                        />
                    </div>
                    <span className={'text-xs'}>
                        Note:{' '}
                        <span>
                            If you dont have docker installed then you can install it
                            from here{' '}
                            <Link
                                className={'text-blue-500'}
                                target={'_blank'}
                                href={'https://docs.docker.com/engine/install/'}
                            >
                                Docker Installation Guide.
                            </Link>
                        </span>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default AgentRunnerModalView;
