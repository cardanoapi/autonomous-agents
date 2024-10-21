import Link from 'next/link';

import { IAgent } from '@api/agents';
import { Copy } from 'lucide-react';

import { SuccessToast } from '@app/components/molecules/CustomToasts';
import environments from '@app/configs/environments';

import { Label } from '../../atoms/label';

const AgentRunnerComponent = ({ agent }: { agent?: IAgent }) => {
    const dockerCommand = `docker run -d --pull always -e NETWORK=${environments.network} -e AGENT_ID=${agent?.id} cardanoapi/autonomous-agents:${environments.NEXT_PUBLIC_IMAGE_TAG}`;
    return (
        <div className={'flex h-full w-full flex-col gap-10'}>
            <div className={'flex flex-col gap-6'}>
                <div className={'flex flex-col gap-2'}>
                    <Label className={'text-sm text-brand-Black-100'}>
                        Agent Runner Command
                    </Label>
                    <div className={'flex w-full items-center gap-2'}>
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
