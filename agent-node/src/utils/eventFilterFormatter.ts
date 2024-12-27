import {IBooleanNode, IEventBasedAction} from '../types/eventTriger'

function flattenIds(obj: any) {
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

function flattenFilterChildWithParentId(data: IBooleanNode){
    data.children = data.children.map((child)=>{
        if ("children" in child && child.children.length ===1 && child.children[0].id === child.id){
            return child.children[0]
        }
        return child
    })
    return data
}

export function formatEventFilter(data: IEventBasedAction[]) {
    return data.map((item) => {
        return {
            ...item,
            eventTrigger: {
                ...('children' in item.eventTrigger
                    ? item.eventTrigger.children.length == 1
                        ? flattenIds(flattenFilterChildWithParentId(item.eventTrigger))
                        : flattenFilterChildWithParentId(item.eventTrigger)
                    : item.eventTrigger),
            },
        }
    })
}
