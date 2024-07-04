import Link from 'next/link';

import { Copy } from 'lucide-react';

import { IAgent } from '@app/app/api/agents';
import AgentsIcon from '@app/components/icons/AgentsIcon';
import { SuccessToast } from '@app/components/molecules/CustomToasts';
import environments from '@app/configs/environments';

const AgentRunnerComponent = ({ agent }: { agent?: IAgent }) => {
    const dockerCommand = `docker run --pull always -e WS_URL=${environments.NEXT_PUBLIC_WS_URL} -e AGENT_ID=${agent?.id} cardanoapi/cardano-autonomous-agent-agent-node:${environments.NEXT_PUBLIC_IMAGE_TAG}`;
    return (
        <div className={'flex h-full w-full flex-col gap-10'}>
            <div className={'flex items-center gap-3'}>
                <AgentsIcon />
                <span className={'text-[20px] font-semibold'}>Manual Trigger</span>
            </div>
            <div className={'flex flex-col gap-6'}>
                <span className={''}>Run this agent by following tutorial:</span>
                <div className={'flex flex-col gap-2'}>
                    <span className={'text-base font-semibold text-brand-Black-100'}>
                        Using Docker:
                    </span>
                    <div className={'flex w-full items-center gap-1'}>
                        <div
                            onClick={() => {
                                navigator.clipboard.writeText(dockerCommand);
                                SuccessToast('Docker Command Copied!');
                            }}
                            className={
                                'w-fit cursor-pointer rounded bg-blue-100 p-2 font-sans text-sm drop-shadow-sm hover:text-brand-Black-300/90'
                            }
                        >
                            {dockerCommand}
                        </div>
                        <Copy
                            color="#A1A1A1"
                            className=" w- h-5 hover:cursor-pointer"
                            onClick={() => {
                                navigator.clipboard.writeText(dockerCommand);
                                SuccessToast('Docker Command Copied!');
                            }}
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
                {/*<div className={'flex flex-col gap-2'}>*/}
                {/*    <span className={'text-base font-semibold text-brand-Black-100'}>*/}
                {/*        Running below script :*/}
                {/*    </span>*/}
                {/*</div>*/}
            </div>
        </div>
    );
};

export default AgentRunnerComponent;
