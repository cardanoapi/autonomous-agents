import { useEffect, useState } from 'react';

import { IEventTrigger, IFilterNode } from '@api/agents';
import { Canvas, EdgeData, NodeData } from 'reaflow';

interface NodeGraphProps {
    data: IEventTrigger;
    className?: string;
    maxHeight?: number;
    maxWidth?: number;
}

export default function EventTriggerGraph({
    data,
    className,
    maxHeight,
    maxWidth
}: NodeGraphProps) {
    const [nodes, setNodes] = useState<NodeData[]>([]);
    const [edges, setEdges] = useState<EdgeData[]>([]);

    const getNodeWidth = (value: string) => {
        return Math.min(Math.max(value.length * 15, 60), 350);
    };

    const reduceString = (strList: string[] | string): string => {
        if (typeof strList === 'string') return strList;
        return strList.join('.');
    };

    useEffect(() => {
        const newNodes: NodeData[] = [];
        const newEdges: EdgeData[] = [];

        const truncate = (text: string) => {
            if (text.length > 50) {
                return text.slice(0, 50) + '...';
            }
            return text;
        };

        const addNode = (id: string, text?: string) => {
            newNodes.push({
                id: id,
                text: truncate(text ? text : id),
                width: getNodeWidth(text ? text : id)
            });
        };

        const addEdge = (parentId: string, childId: string) => {
            newEdges.push({
                id: `${parentId}-${childId}`,
                from: `${parentId}`,
                to: `${parentId}.${childId}`
            });
        };

        const reduceStr = (text: string | string[]) => {
            if (typeof text === 'string') {
                return text;
            }
            return text.join('.');
        };

        const addNodesRecursively = (obj: IFilterNode, parentId: string) => {
            if (obj.id) {
                const currentId = parentId + '.' + reduceStr(obj.id);

                let nodeText = reduceStr(obj.id) + ` ( ${obj.operator} ) `;
                if ('value' in obj) {
                    nodeText = nodeText + obj.value;
                }

                if (obj.negate) {
                    nodeText = 'NOT ( ' + nodeText + ')';
                }

                addNode(currentId, nodeText);
                addEdge(parentId, reduceStr(obj.id));

                if ('children' in obj) {
                    obj.children.forEach((childObj) => {
                        addNodesRecursively(childObj, currentId);
                    });
                }
            }
            if (!('id' in obj) && 'children' in obj) {
                obj.children.forEach((childObj) => {
                    addNodesRecursively(childObj, parentId);
                });
            }
        };

        // Initalize Root node and edge
        const rootId = reduceString(data.id);
        newNodes.push({
            id: rootId,
            text: data.id + ` ( ${data.operator} ) `,
            width: getNodeWidth(data.id + ` ${data.operator} `)
        });

        data.parameters.forEach((param) => {
            // recursivelyAddNode(param, operatorId);
            addNodesRecursively(param, rootId);
        });

        setNodes(newNodes);
        setEdges(newEdges);
    }, [data]);

    return (
        <Canvas
            nodes={
                Array.from(new Set(nodes.map((node) => JSON.stringify(node)))).map(
                    (node) => JSON.parse(node)
                ) as NodeData[]
            } //ensure nodes are unique
            edges={
                Array.from(new Set(edges.map((edge) => JSON.stringify(edge)))).map(
                    (edge) => JSON.parse(edge)
                ) as EdgeData[]
            } // ensure edges are unique
            pannable={true}
            panType="scroll"
            maxHeight={maxHeight || 800}
            maxWidth={maxWidth || 1600}
            className={`w-full bg-[#D2E0FB] ${className || ''}`}
            direction="RIGHT"
            zoomable={true}
        />
    );
}
