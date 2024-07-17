import { Kuber } from './KuberService'
import { AgentWalletDetails } from '../types/types'

export class AgentTransactionBuilder {
    private static agentTxBuilderInstance: AgentTransactionBuilder

    kuber: Kuber
    agentWalletDetails: AgentWalletDetails

    constructor(agentWalletDetails: AgentWalletDetails) {
        this.agentWalletDetails = agentWalletDetails
        this.kuber = new Kuber(
            this.agentWalletDetails.agent_address,
            this.agentWalletDetails.payment_signing_key
        )
    }

    public static setInstance(agentWalletDetails: AgentWalletDetails) {
        AgentTransactionBuilder.agentTxBuilderInstance =
            new AgentTransactionBuilder(agentWalletDetails)
    }

    public static getInstance() {
        return AgentTransactionBuilder.agentTxBuilderInstance
            ? AgentTransactionBuilder.agentTxBuilderInstance
            : null
    }
    transferADA(receiverAddress: string, ADA = 10) {
        const req = {
            outputs: {
                address: receiverAddress,
                value: `${ADA}A`,
            },
        }
        return this.kuber.signTx(req)
    }

    dRepRegistration() {
        const req = {
            inputs: this.agentWalletDetails.agent_address,
            certificates: [
                Kuber.generateCert(
                    'registerdrep',
                    this.agentWalletDetails.stake_verification_key_hash
                ),
            ],
        }
        return this.kuber.signTx(req, this.agentWalletDetails.stake_signing_key)
    }

    dRepDeRegistration() {
        const req = {
            inputs: this.agentWalletDetails.agent_address,
            certificates: [
                Kuber.generateCert(
                    'deregisterdrep',
                    this.agentWalletDetails.stake_verification_key_hash
                ),
            ],
        }
        return this.kuber.signTx(req, this.agentWalletDetails.stake_signing_key)
    }

    stakeDelegation(drepId: string) {
        const req = {
            certificates: [
                Kuber.generateCert(
                    'delegate',
                    this.agentWalletDetails.payment_verification_key_hash,
                    drepId
                ),
            ],
        }
        return this.kuber.signTx(req, this.agentWalletDetails.stake_signing_key)
    }

    proposalNewConstitution(
        anchorUrl: string,
        anchorDataHash: string,
        newConstitutionUrl: string,
        newConstitutionDataHash: string
    ) {
        const rewardAddress = this.kuber.rewardAddressBech32(
            0,
            this.agentWalletDetails.stake_verification_key_hash
        )
        const req = {
            proposals: [
                {
                    anchor: {
                        url: anchorUrl,
                        dataHash: anchorDataHash,
                    },
                    newConstitution: {
                        url: newConstitutionUrl,
                        dataHash: newConstitutionDataHash,
                    },
                    refundAccount: rewardAddress,
                },
            ],
        }
        return this.kuber.signTx(req, this.agentWalletDetails.stake_signing_key)
    }
    registerStake() {
        const req = {
            certificates: [
                Kuber.generateCert(
                    'registerstake',
                    this.agentWalletDetails.payment_verification_key_hash
                ),
            ],
        }
        return this.kuber.signTx(req, this.agentWalletDetails.stake_signing_key)
    }

    stakeDeRegistration() {
        const req = {
            inputs: this.agentWalletDetails.agent_address,
            outputs: {
                address: this.agentWalletDetails.agent_address,
                value: '10A',
                addChange: true,
            },
            certificates: [
                Kuber.generateCert(
                    'deregisterstake',
                    this.agentWalletDetails.stake_verification_key_hash
                ),
            ],
        }
        return this.kuber.signTx(req, this.agentWalletDetails.stake_signing_key)
    }

    createInfoGovAction(anchorUrl?: string, anchorDataHash?: string) {
        const infoProposal = {
            refundAccount: {
                network: 'Testnet',
                credential: {
                    'key hash':
                        this.agentWalletDetails.stake_verification_key_hash ||
                        'db1bc3c3f99ce68977ceaf27ab4dd917123ef9e73f85c304236eab23',
                },
            },
            anchor: {
                url: anchorUrl || 'https://bit.ly/3zCH2HL',
                dataHash:
                    anchorDataHash ||
                    '1111111111111111111111111111111111111111111111111111111111111111',
            },
        }
        return this.kuber.signTx({
            proposals: [infoProposal],
        })
    }

    voteOnProposal(proposal: string, anchorUrl: string, anchorHash: string) {
        const req = {
            vote: {
                voter: this.agentWalletDetails.drep_id,
                role: 'drep',
                proposal,
                vote: true,
                anchor: {
                    url: anchorUrl ? anchorUrl : 'https://bit.ly/3zCH2HL',
                    dataHash: anchorHash
                        ? anchorHash
                        : '1111111111111111111111111111111111111111111111111111111111111111',
                },
            },
        }
        return this.kuber.signTx(req, this.agentWalletDetails.stake_signing_key)
    }

    abstainDelegation() {
        const req = {
            certificates: [
                Kuber.generateCert(
                    'delegate',
                    this.agentWalletDetails.stake_verification_key_hash,
                    'abstain'
                ),
            ],
        }
        return this.kuber.signTx(req, this.agentWalletDetails.stake_signing_key)
    }

    noConfidence() {
        const noConfidenceProposal = {
            refundAccount: {
                network: 'Testnet',
                credential: {
                    'key hash':
                        this.agentWalletDetails.stake_verification_key_hash ||
                        'db1bc3c3f99ce68977ceaf27ab4dd917123ef9e73f85c304236eab23',
                },
            },
            anchor: {
                url: 'https://bit.ly/3zCH2HL',
                dataHash:
                    '1111111111111111111111111111111111111111111111111111111111111111',
            },
        }
        return this.kuber.signTx({
            proposals: [noConfidenceProposal],
        })
    }
}
