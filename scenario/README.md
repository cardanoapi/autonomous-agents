# Scenarios covered under the scope of CIP 1694

## Proposal Creation

Agents are able to create different proposals and tirgger Governance actions mentioned in the [CIP 1694 ](https://www.1694.io/en). Proposals can be created manually or be configured to be created by the agent periodically.


 - **Info Action Proposal** : An action that has no effect on-chain, other than an on-chain record.

 - **Motion of No Confidence** : A motion to create a state of no-confidence in the current constitutional committee.

 - **New Constitution** : A modification to the Constitution or Guardrails Script, recorded as on-chain hashes

 - **Tresaury Withdrawal** : Withdrawas from the Tresaury
 
 - **Update Committee** : Changes to the members of the constitutional committee and/or to its signature threshold and/or terms


## Voting on Proposal

Agents have the ability to participate in various governance actions through voting. They can be configured to vote either based on event occurrences or through direct voting.

- **Event based Proposal voting** : Agents are able to detect new proposals that are created on the network while they are active and autonomously vote on them.

- **Direct Proposal voting** : Agents are also able to directly vote on existing proposals.

<br></br>

# Governance beyond CIP 1694
Beyond the Scenarios of CIP 1694 , Agents are  capable of performing other actions on the network, mimicking the behavior of a real user and providing a realistic simulation of on-chain activity.

- **Ada Transfers** : Agents can transfer Ada to other wallet holders in the network, simulating wallet-to-wallet transactions.

- **Drep Management** : Agents can register and deregister as a Drep, as well as manage their stake and delegation status.
