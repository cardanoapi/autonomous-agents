import { IDRepInternal } from '@models/types';
import { convertLovelaceToAda } from '@utils';

import { AppDialogContent } from '@app/app/components/AppDialog';

export default function DrepDetailDialogContent({ dRep }: { dRep: IDRepInternal }) {
    const formattedVotingPower = convertLovelaceToAda(dRep.votingPower).toLocaleString(
        'en-Us'
    );

    return (
        <AppDialogContent title={dRep.dRepName || 'Data Missing'}>
            <div className="rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                        <p className="w-64 truncate text-sm font-semibold text-gray-700">
                            Drep ID: {dRep.drepId}
                        </p>
                        <div className="flex gap-2">
                            {dRep.agentId && dRep.agentName && (
                                <span className="inline-flex rounded-full bg-brand-Gray-400 px-2 py-1 text-xs text-gray-800">
                                    Internal Drep
                                </span>
                            )}
                            {dRep.status === 'Active' && (
                                <span className="inline-flex rounded-full bg-brand-Green-100 px-2 py-1 text-xs text-green-800">
                                    {dRep.status}
                                </span>
                            )}
                        </div>
                    </div>

                    <p className="text-sm text-gray-800">
                        Voting Power: {formattedVotingPower}
                    </p>

                    {dRep.references && dRep.references.length > 0 && (
                        <p className="text-sm text-gray-800">
                            References: {dRep.references.join(', ')}
                        </p>
                    )}

                    <p className="text-sm text-gray-700">
                        {dRep.bio ? dRep.bio : 'No bio available'}
                    </p>

                    {dRep.agentId && dRep.agentName && (
                        <div className="flex flex-col space-y-1">
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
            </div>
        </AppDialogContent>
    );
}
