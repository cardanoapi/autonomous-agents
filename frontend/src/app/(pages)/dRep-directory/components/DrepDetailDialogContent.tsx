import { IDRepInternal } from '@models/types';
import { convertLovelaceToAda } from '@utils';
import { CopyIcon } from 'lucide-react';
import { ExternalLink } from 'lucide-react';

import { AppDialogContent } from '@app/app/components/AppDialog';
import { SuccessToast } from '@app/components/molecules/CustomToasts';

export default function DrepDetailDialogContent({ dRep }: { dRep: IDRepInternal }) {
    const formattedVotingPower = convertLovelaceToAda(dRep.votingPower).toLocaleString(
        'en-US'
    );

    const redirectToGovTool = () => {
        window.open(
            `https://govtool.cardanoapi.io/connected/drep_directory/${dRep.drepId}`,
            '_blank'
        );
    };

    return (
        <AppDialogContent className="pt-0">
            <div className="mb-4 flex items-center gap-2">
                <span className="text-lg font-semibold">
                    {dRep.dRepName || 'Data Missing'}
                </span>
                <ExternalLink
                    className="cursor-pointer text-blue-600"
                    onClick={redirectToGovTool}
                />
            </div>
            <div className="space-y-4 rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-start justify-between">
                    <p className="max-w-xs truncate text-sm font-semibold text-gray-700">
                        Drep ID: {dRep.drepId}
                    </p>
                    <div className="flex gap-2">
                        {dRep.agentId && dRep.agentName && (
                            <span className="inline-flex items-center rounded-full bg-gray-200 px-2 py-1 text-xs text-gray-800">
                                Internal Drep
                            </span>
                        )}
                        {dRep.status === 'Active' && (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                                {dRep.status}
                            </span>
                        )}
                    </div>
                </div>

                <p className="text-sm text-gray-800">
                    Voting Power: {formattedVotingPower} ADA
                </p>

                {dRep.references && dRep.references.length > 0 && (
                    <p className="text-sm text-gray-800">
                        References: {dRep.references.join(', ')}
                    </p>
                )}

                <p className="text-sm text-gray-700">
                    {dRep.bio || 'No bio available'}
                </p>

                <DRepDetails dRep={dRep} />

                {dRep.agentId && dRep.agentName && (
                    <div className="space-y-1">
                        <p className="text-sm text-gray-800">
                            Agent ID: {dRep.agentId}
                        </p>
                        <p className="text-sm text-gray-800">
                            Agent Name: {dRep.agentName}
                        </p>
                    </div>
                )}

                {!dRep.dRepName && (
                    <p className="text-sm text-red-600">
                        The data used when this DRep was created has been formatted
                        incorrectly.
                    </p>
                )}
            </div>
        </AppDialogContent>
    );
}

const DRepDetails = ({ dRep }: { dRep: IDRepInternal }) => {
    const openExternalUrl = () => {
        if (dRep.url) {
            window.open(dRep.url, '_blank');
        }
    };

    const copyToClipboard = (text: string, message: string) => {
        navigator.clipboard.writeText(text || '');
        SuccessToast(message || 'Copied to clipboard!');
    };

    const renderExternalUrl = () => (
        <p className="flex items-center gap-2 text-sm text-gray-700">
            External URL:
            {dRep.url ? (
                <span
                    onClick={openExternalUrl}
                    className="cursor-pointer truncate text-blue-800"
                >
                    {dRep.url}
                </span>
            ) : (
                <span>No URL available</span>
            )}
        </p>
    );

    const renderLatestTxHash = () => (
        <p className="flex items-center gap-2 text-sm text-gray-700">
            Latest Tx Hash:
            {dRep.latestTxHash ? (
                <div className="flex w-80 items-center">
                    <span className="truncate text-gray-800">{dRep.latestTxHash}</span>
                    <CopyIcon
                        onClick={() =>
                            copyToClipboard(dRep.latestTxHash || '', 'Tx Hash copied')
                        }
                    />
                </div>
            ) : (
                <span>No latest tx hash available</span>
            )}
        </p>
    );

    const renderMetaDataHash = () => (
        <p className="flex items-center gap-2 text-sm text-gray-700">
            MetaData Hash:
            {dRep.metadataHash ? (
                <div className="flex w-64 items-center">
                    <span className="truncate text-gray-800">{dRep.metadataHash}</span>
                    <CopyIcon
                        onClick={() =>
                            copyToClipboard(
                                dRep.metadataHash || '',
                                'Metadata Hash copied'
                            )
                        }
                    />
                </div>
            ) : (
                <span>MetaData Hash not available</span>
            )}
        </p>
    );

    const renderLatestRegistrationDate = () => (
        <p className="flex items-center gap-2 text-sm text-gray-700">
            Latest Registration Date:
            {dRep.latestRegistrationDate ? (
                <span className="truncate">
                    {new Date(dRep.latestRegistrationDate).toLocaleString()}
                </span>
            ) : (
                <span>No latest registration date available</span>
            )}
        </p>
    );

    return (
        <>
            {renderMetaDataHash()}
            {renderLatestTxHash()}
            {renderExternalUrl()}
            {renderLatestRegistrationDate()}
        </>
    );
};
