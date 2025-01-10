import Link from 'next/link';

import {Copy} from 'lucide-react';

import {SuccessToast} from '@app/components/molecules/CustomToasts';
import environments from '@app/configs/environments';
import {convertToBase64} from '@app/utils/base64converter';

const AgentRunnerTutorial = ({agentSecretKey, showToken}: { agentSecretKey: string; showToken?: boolean }) => {
    const dockerCommand = environments.NEXT_PUBLIC_MANAGER_BASE_DOMAIN ? `docker run -d --network=${environments.NEXT_PUBLIC_DOCKER_NETWORK_NAME || 'autonomous_agent'} -e TOKEN=${convertToBase64(agentSecretKey)} -e MANAGER_BASE_DOMAIN=${environments.NEXT_PUBLIC_MANAGER_BASE_DOMAIN} ${environments.NEXT_PUBLIC_AGENT_NODE_DOCKER_IMAGE_NAME||'cardanoapi/autonomous-agents:Dev'}` : `docker run -d --pull always -e TOKEN=${convertToBase64(agentSecretKey)} cardanoapi/autonomous-agents:${environments.NEXT_PUBLIC_IMAGE_TAG}`;

    return (
        <div className={'flex w-full flex-col gap-6 '}>
            <span className={''}>Run this agent by following tutorial:</span>
            <div className={'flex w-full flex-col gap-2 overflow-hidden'}>
                <span className={'font-norm text-base text-brand-Black-100'}>Using Docker:</span>
                <div className={'flex w-full items-center gap-1 overflow-hidden'}>
                    <div
                        onClick={() => {
                            navigator.clipboard.writeText(dockerCommand);
                            SuccessToast('Docker Command Copied!');
                        }}
                        className={
                            'w-full cursor-pointer overflow-hidden rounded bg-blue-100 p-2 font-sans text-sm drop-shadow-sm hover:text-brand-Black-300/90 '
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
                        If you dont have docker installed then you can install it from here{' '}
                        <Link
                            className={'text-blue-500'}
                            target={'_blank'}
                            href={'https://docs.docker.com/engine/install/'}
                        >
                            Docker Installation Guide.
                        </Link>
                    </span>
                </span>
                {showToken && (
                    <div className={'flex flex-row items-end gap-2 pt-2 text-sm font-normal text-brand-Black-300'}>
                        Token :
                        <div
                            onClick={() => {
                                navigator.clipboard.writeText(convertToBase64(agentSecretKey));
                                SuccessToast('Token Copied!');
                            }}
                            className={'cursor-pointer text-xs'}
                        >
                            {convertToBase64(agentSecretKey)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgentRunnerTutorial;
