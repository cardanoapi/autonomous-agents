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

# Scenario Testing and Evidence

Tests were executed at [agents.cardanoapi.io](https://agents.cardanoapi.io) on SanchoNet.

## Info Action Proposal Creation


<img src="./assets/InfoActionCreation.gif?raw=true" width="800" height="400" />

**Governance Action ID** : 8dea16c7e047e4a6de60ac928f33ac36ef9755e38d66a6c7f7870ad8b271bda8#0

**Epoch** : 524

## Update Committee Proposal Creation

<img src="./assets/UpdateCommittee.gif?raw=true" width="800" height="400" />

**Gocernance Action ID** : 
770354b2132cf55f9d7fdede0be186a5f90ccc8238fb2a061a86177b848ea81e

**Epoch** : 525


## New Constitution Proposal Creation

<img src="./assets/NewConstitution.gif?raw=true" width="800" height="400" />

**Governance Action ID** :
64397d882477f795cf209b516685e30d52ee1336654198b1e7e963d3da099520#0

**Epoch** : 525

## Tresury Withdrawal Proposal Creation

<img src="./assets/TresuryWithdrawal.gif?raw=true" width="800" height="400" />

**Governance Action ID**: 8accd7d79ed6e4f98bc538c2aea8998c0cb03255b23bb5af408d7c3201dc9b44#0

**Epoch** : 525

## Multiple Agents Voting Directly 


<img src="./assets/MultipleAgentsVoting.gif?raw=true" width="800" height="400" />

**Transaction Hash**
 - 626b64310f0976f4de2fd0bd85ebe481019c6d67d2b83a8d8bebe814c72f2723
 - 8c38a0f4625c30ef556d5f1aa3c40a3ba25ba8b26285e2a6fb02a22cd66f6652
 - 36eb0f174fb0f58a567bb403d4a365617c7abc3666a480711ac1c47d204eed7e
 - 3a383fe969e2210ee843d4f863ec53037e53741a6dc3523c4ffd5074d4a7d357
 - 8318450e2bee736c73f0c790b8bf175301ab93745b35be1e988d6f051ac5f100


## Event Based Agents Voting Autonomously

<img src="./assets/EventBasedVoting.gif?raw=true" width="800" height="400" />

**Governance Action ID** : 
a5ea393f80a88320e457a1e4f5c8ffb4e198efe9ae798458fc13011f222f3a0c#0

**Transaction Hash**
- 976b6de916ecaa6294c8d0876e39f4df30781813bed92952e03fea340eb8ec26
- fc5924655c91c8c0e3468128b5af702f6c83745591ad14d518d3fcee5856d790

## Multiple Agents Delegating to a DRep

<img src="./assets/MultipleAgentsDelegation.gif?raw=true" width="800" height="400" />

**DRep ID** :
766fea13963a6c27a98d4c48221548cc3e2d10ad7c085c5fb9936dfa

**Transaction Hash** :
- 6970a725bc883ce08beb0240507b6886c60185cbb4ea3627362f62492404a5ed
- 4f4a5130c7285d3585345c5b1f89a6e184889039908b85a6ca5fd714f86ed34b
- dfc3262b717f7bec91cdea749599e31d8250a4552f0887bc9ab85b6d8c19c7f9
- dfc3262b717f7bec91cdea749599e31d8250a4552f0887bc9ab85b6d8c19c7f9
- c2604bccf2b35bbc172bfacf694b7a8b709188d8b427ad198c209f82c4c374ab

<br></br>

# Additional Features 
- Ada Transfer 
- Drep Register / DeRegister
- Stake Register / DeRegister