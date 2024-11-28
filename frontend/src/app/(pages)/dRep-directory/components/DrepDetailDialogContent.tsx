import { IDRepInternal } from '@models/types';
import { Typography } from '@mui/material';
import { convertLovelaceToAda, hexToBech32 } from '@utils';
import { CopyIcon, ExternalLink } from 'lucide-react';

import { AppDialogContent } from '@app/app/components/AppDialog';
import { SuccessToast } from '@app/components/molecules/CustomToasts';
import { Truncate } from '@app/utils/common/extra';

import { getDrepGivedName } from './DRepCard';

export default function DrepDetailDialogContent({
    dRep,
    onClose
}: {
    dRep: IDRepInternal;
    onClose?: (value: boolean) => void;
}) {
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
        <AppDialogContent className=" pt-0" onClose={onClose}>
            <div className="mb-4 flex items-center gap-2">
                <span className="text-lg font-semibold">
                    {getDrepGivedName(dRep) || 'Data Missing'}
                </span>
                <ExternalLink
                    className="cursor-pointer text-blue-600"
                    onClick={redirectToGovTool}
                />
            </div>
            <div className="w-full space-y-4 rounded-lg border border-gray-200 p-4 shadow-sm md:w-[520px]">
                <div className="flex items-start justify-between">
                    <Typography className="max-w-xs truncate text-sm font-semibold text-gray-700">
                        Drep ID: {hexToBech32(dRep.drepId)}
                    </Typography>
                    <div className="flex gap-2">
                        {dRep.agentId && dRep.agentName && (
                            <Typography className="inline-flex items-center rounded-full bg-gray-200 px-2 py-1 text-xs text-gray-800">
                                Internal Drep
                            </Typography>
                        )}
                        {dRep.status === 'Active' && (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                                {dRep.status}
                            </span>
                        )}
                    </div>
                </div>

                <Typography className="text-sm text-gray-800">
                    Voting Power: {formattedVotingPower} ADA
                </Typography>

                {dRep.references && dRep.references.length > 0 && (
                    <Typography className="text-sm text-gray-800">
                        References: {dRep.references.join(', ')}
                    </Typography>
                )}

                <Typography className="text-sm text-gray-700">
                    {dRep.bio || 'No bio available'}
                </Typography>

                <DRepDetails dRep={dRep} />

                {dRep.agentId && dRep.agentName && (
                    <div className="space-y-1">
                        <Typography className="text-sm text-gray-800">
                            Agent ID: {dRep.agentId}
                        </Typography>
                        <Typography className="text-sm text-gray-800">
                            Agent Name: {dRep.agentName}
                        </Typography>
                    </div>
                )}
                {!dRep.givenName && (
                    <Typography className="text-sm text-red-600">
                        The data used when this DRep was created has been formatted
                        incorrectly.
                    </Typography>
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
        <Typography className="flex items-center gap-2 text-sm text-gray-700 ">
            External URL:
            {dRep.url ? (
                <Typography
                    onClick={openExternalUrl}
                    className=" cursor-pointer text-blue-800"
                >
                    {Truncate(dRep.url, 10)}
                </Typography>
            ) : (
                <span>No URL available</span>
            )}
        </Typography>
    );

    const renderLatestTxHash = () => (
        <p className="flex items-center gap-2 text-sm text-gray-700">
            Latest Tx Hash:
            {dRep.latestTxHash ? (
                <div className="flex w-80 items-center">
                    <Typography className="truncate text-gray-800">
                        {dRep.latestTxHash}
                    </Typography>
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
        <Typography className="flex items-center gap-2 text-sm text-gray-700">
            MetaData Hash:
            {dRep.metadataHash ? (
                <div className="flex w-64 items-center">
                    <Typography className="truncate text-gray-800">
                        {dRep.metadataHash}
                    </Typography>
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
        </Typography>
    );

    const renderLatestRegistrationDate = () => (
        <Typography className="flex items-center gap-2 text-sm text-gray-700">
            Latest Registration Date:
            {dRep.latestRegistrationDate ? (
                <Typography className="truncate">
                    {new Date(dRep.latestRegistrationDate).toLocaleString()}
                </Typography>
            ) : (
                <span>No latest registration date available</span>
            )}
        </Typography>
    );

    return (
        <div className={'w-full space-y-4'}>
            {renderMetaDataHash()}
            {renderLatestTxHash()}
            {renderExternalUrl()}
            {renderLatestRegistrationDate()}
        </div>
    );
};
