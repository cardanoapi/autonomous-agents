// import { IEventTrigger } from "@api/agents";

// const demoData: IEventTrigger = {
//     id: 'tx',
//     negate: false,
//     operator: 'AND',
//     parameters: [
//         {
//             negate: false,
//             id: ['inputs', 'address'],
//             value: 'addr_test1qqgn33e8vc40948u4crwsq7dxk9e6kuf3amp6gf4k57n97prsqy2pgnvcwzlutpc6a2ttwnuggl36hy4vkm227zdy0gq9mj2yv',
//             operator: 'equals'
//         },
//         {
//             negate: false,
//             children: [
//                 {
//                     id: ['outputs', 'value'],
//                     value: 999,
//                     negate: true,
//                     operator: 'greaterThan'
//                 },
//                 {
//                     id: ['outputs', 'address'],
//                     value: 'addr.....',
//                     negate: false,
//                     operator: 'equals'
//                 }
//             ],
//             operator: 'AND'
//         }
//     ]
// };

// const nestedData: IEventTrigger = {
//     id: 'tx',
//     negate: false,
//     operator: 'AND',
//     parameters: [
//         {
//             negate: false,
//             id: ['inputs', 'address'],
//             value: 'addr_test1qqgn33e8vc40948u4crwsq7dxk9e6kuf3amp6gf4k57n97prsqy2pgnvcwzlutpc6a2ttwnuggl36hy4vkm227zdy0gq9mj2yv',
//             operator: 'equals'
//         },
//         {
//             id: 'outputs',
//             negate: false,
//             children: [
//                 {
//                     id: ['value'],
//                     value: 999,
//                     negate: true,
//                     operator: 'greaterThan'
//                 },
//                 {
//                     id: ['address'],
//                     value: 'addr.....',
//                     negate: false,
//                     operator: 'equals'
//                 }
//             ],
//             operator: 'AND'
//         }
//     ]
// };
