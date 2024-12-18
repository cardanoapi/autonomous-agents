import { IEventBasedAction } from '../types/eventTriger'

function restructureData(obj: any) {
    const ids: any = []

    function flattenChildren(node: any) {
        if (node.id) {
            ids.push(node.id) // Push id to ids array
        }

        if (Array.isArray(node.children)) {
            let flatChildren: any = []
            for (const child of node.children) {
                if (child.children) {
                    flatChildren = flatChildren.concat(flattenChildren(child))
                } else {
                    flatChildren.push(child)
                }
            }
            return flatChildren
        }
        return []
    }

    const flatChildren = flattenChildren(obj)

    return {
        id: ids,
        children: flatChildren,
        negate: obj.negate,
        operator: obj.operator,
    }
}

export function formatEventFilter(data: IEventBasedAction[]) {
    return data.map((item) => {
        return {
            ...item,
            eventTrigger: {
                ...('children' in item.eventTrigger
                    ? item.eventTrigger.children.length == 1
                        ? restructureData(item.eventTrigger)
                        : item.eventTrigger
                    : item.eventTrigger),
            },
        }
    })
}
