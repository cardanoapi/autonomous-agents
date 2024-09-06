"use strict";(self.webpackChunkmy_website=self.webpackChunkmy_website||[]).push([[443],{8798:(e,n,i)=>{i.r(n),i.d(n,{assets:()=>o,contentTitle:()=>a,default:()=>h,frontMatter:()=>r,metadata:()=>c,toc:()=>d});var s=i(4848),t=i(8453);const r={sidebar_position:1},a="Architecture",c={id:"architecture",title:"Architecture",description:"Architecture Diagram",source:"@site/docs/architecture.md",sourceDirName:".",slug:"/architecture",permalink:"/autonomous-agents/archietecture_docusaurus/docs/architecture",draft:!1,unlisted:!1,editUrl:"https://github.com/cardanoapi/autonomous-agents.git/docs/architecture.md",tags:[],version:"current",sidebarPosition:1,frontMatter:{sidebar_position:1},sidebar:"tutorialSidebar"},o={},d=[{value:"Architecture Diagram",id:"architecture-diagram",level:3},{value:"Services",id:"services",level:2},{value:"Frontend (Next.js)",id:"frontend-nextjs",level:3},{value:"Backend (FastAPI)",id:"backend-fastapi",level:3},{value:"Kafka Service",id:"kafka-service",level:4},{value:"PostgreSQL Database",id:"postgresql-database",level:4},{value:"Kuber Service",id:"kuber-service",level:4},{value:"Agent Manager",id:"agent-manager",level:4},{value:"Agent Manager",id:"agent-manager-1",level:3},{value:"Agent",id:"agent",level:3},{value:"Kafka Service",id:"kafka-service-1",level:3},{value:"Cardano Node",id:"cardano-node",level:3},{value:"Kuber",id:"kuber",level:3}];function l(e){const n={admonition:"admonition",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",img:"img",li:"li",p:"p",ul:"ul",...(0,t.R)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.h1,{id:"architecture",children:"Architecture"}),"\n",(0,s.jsx)(n.h3,{id:"architecture-diagram",children:"Architecture Diagram"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.img,{alt:"Autonomous Agent Architecture",src:i(7701).A+"",width:"2236",height:"1177"})}),"\n",(0,s.jsx)(n.h2,{id:"services",children:"Services"}),"\n",(0,s.jsx)(n.h3,{id:"frontend-nextjs",children:"Frontend (Next.js)"}),"\n",(0,s.jsxs)(n.p,{children:["In this service, users can view a dashboard for insightful information regarding ",(0,s.jsx)(n.code,{children:"triggerHistory"}),", ",(0,s.jsx)(n.code,{children:"number of agents"}),", ",(0,s.jsx)(n.code,{children:"number of proposals"}),", and ",(0,s.jsx)(n.code,{children:"number of votes"}),". Furthermore, users can perform the following actions:"]}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:["View trigger logs through the ",(0,s.jsx)(n.code,{children:"Logs"})," tab."]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsx)(n.p,{children:"Create templates with desired functions and different trigger types."}),"\n",(0,s.jsx)(n.admonition,{type:"info",children:(0,s.jsx)(n.p,{children:"Trigger types are either CRON-based or Event-based."})}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsx)(n.p,{children:"Create agents based on the available templates."}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsx)(n.p,{children:"Manually trigger available functions for individual agents."}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:["Edit and delete individual ",(0,s.jsx)(n.code,{children:"template"})," or ",(0,s.jsx)(n.code,{children:"agent"}),"."]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:["View the ",(0,s.jsx)(n.code,{children:"Drep Directory"})," list available on SanchoNet where they can delegate to available Dreps."]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:["View the ",(0,s.jsx)(n.code,{children:"Governance Actions"})," list available on SanchoNet where they can vote on available actions."]}),"\n"]}),"\n"]}),"\n",(0,s.jsx)(n.h3,{id:"backend-fastapi",children:"Backend (FastAPI)"}),"\n",(0,s.jsx)(n.p,{children:"This service is connected to multiple services for various purposes:"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsx)(n.h4,{id:"kafka-service",children:"Kafka Service"}),"\n",(0,s.jsxs)(n.p,{children:["Publishes messages related to ",(0,s.jsx)(n.code,{children:"Agent_Configuration_Update"}),", ",(0,s.jsx)(n.code,{children:"Manual_Action_Trigger"}),", and ",(0,s.jsx)(n.code,{children:"Agent_Deletion"}),"."]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsx)(n.h4,{id:"postgresql-database",children:"PostgreSQL Database"}),"\n",(0,s.jsxs)(n.p,{children:["Stores data related to ",(0,s.jsx)(n.code,{children:"Trigger"}),", ",(0,s.jsx)(n.code,{children:"TriggerHistory"}),", ",(0,s.jsx)(n.code,{children:"Agent"}),", and ",(0,s.jsx)(n.code,{children:"Templates"}),"."]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsx)(n.h4,{id:"kuber-service",children:"Kuber Service"}),"\n",(0,s.jsx)(n.p,{children:"Fetches the wallet information related to a particular agent."}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsx)(n.h4,{id:"agent-manager",children:"Agent Manager"}),"\n",(0,s.jsx)(n.p,{children:"Passes information about various private keys related to the agent."}),"\n"]}),"\n"]}),"\n",(0,s.jsx)(n.h3,{id:"agent-manager-1",children:"Agent Manager"}),"\n",(0,s.jsxs)(n.p,{children:["This service handles WebSocket creation using the RPC protocol. It consumes messages from Kafka and, depending on the message type, either broadcasts them to all active agents or sends them to a specific agent. Additionally, it listens for events from the Cardano Node and broadcasts these events to all active agents. It also interacts with the ",(0,s.jsx)(n.code,{children:"Backend sevice"})," to fetch agent private keys."]}),"\n",(0,s.jsx)(n.p,{children:"The primary function of the service is to submit transactions to the Kuber service as requested by the agents. After submitting a transaction, it logs the response to the PostgreSQL database, which is subsequently displayed in the UI."}),"\n",(0,s.jsx)(n.h3,{id:"agent",children:"Agent"}),"\n",(0,s.jsx)(n.p,{children:"The service connects to the Agent Manager service via WebSocket using the RPC protocol and executes actions as configured. It receives various messages from the Agent Manager Service, including blocks of transactions, agent configurations, and manual action triggers. Based on these messages, it performs actions according to the CRON schedule, event-based triggers, or manual user commands."}),"\n",(0,s.jsx)(n.p,{children:"The Agent performs the following actions:"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"RegisterDRep"}),"\n",(0,s.jsx)(n.li,{children:"DeRegisterDRep"}),"\n",(0,s.jsx)(n.li,{children:"RegisterStake"}),"\n",(0,s.jsx)(n.li,{children:"DeRegisterStake"}),"\n",(0,s.jsx)(n.li,{children:"Abstain"}),"\n",(0,s.jsx)(n.li,{children:"NoConfidence"}),"\n",(0,s.jsx)(n.li,{children:"StakeDelegation"}),"\n",(0,s.jsx)(n.li,{children:"VoteOnProposal"}),"\n",(0,s.jsx)(n.li,{children:"InfoAction"}),"\n",(0,s.jsx)(n.li,{children:"NewConstitution"}),"\n",(0,s.jsx)(n.li,{children:"Transfer ADA"}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"For event-based actions, it monitors blocks of transactions and executes the relevant action upon detecting suitable transactions. For CRON-based actions, it executes the specified tasks at regular intervals as configured. Manual triggers execute actions when initiated by the user through the UI."}),"\n",(0,s.jsx)(n.p,{children:"In cases where actions like voteOnProposal or stakeDelegation fail due to dependencies on other actions, the service first completes the necessary dependent actions before executing the intended action."}),"\n",(0,s.jsx)(n.h3,{id:"kafka-service-1",children:"Kafka Service"}),"\n",(0,s.jsxs)(n.p,{children:["This service handles the publishing and consumption of messages related to the agent. The ",(0,s.jsx)(n.code,{children:"Backend"})," publishes messages, while the ",(0,s.jsx)(n.code,{children:"Agent Manager"})," consumes them."]}),"\n",(0,s.jsx)(n.h3,{id:"cardano-node",children:"Cardano Node"}),"\n",(0,s.jsxs)(n.p,{children:["The ",(0,s.jsx)(n.code,{children:"Agent Manager"})," receives transaction blocks from this service. These transactions are used to validate submissions made by the Agent Manager on behalf of the Agent."]}),"\n",(0,s.jsx)(n.h3,{id:"kuber",children:"Kuber"}),"\n",(0,s.jsx)(n.p,{children:"Kuber is responsible for submitting transactions initiated by the Agent Manager on behalf of the Agent. It also retrieves the wallet details for the agent."})]})}function h(e={}){const{wrapper:n}={...(0,t.R)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(l,{...e})}):l(e)}},7701:(e,n,i)=>{i.d(n,{A:()=>s});const s=i.p+"assets/images/autonomous_agent-39f7e8be0677a42ce394a64f31d0815d.png"}}]);