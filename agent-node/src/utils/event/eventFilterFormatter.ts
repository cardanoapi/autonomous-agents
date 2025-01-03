import { IBooleanNode, IEventBasedAction } from '../../types/eventTriger'
import { customReplacer } from '../validator'

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

function flattenFilterChildWithParentId(data: IBooleanNode) {
    data.children = data.children.map((child) => {
        if ('children' in child && child.children.length) {
            const similarChild = child.children.find((c) => c.id === child.id)
            if (similarChild) {
                return similarChild
            }
            return child
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

export function reconstructTxFromPaths(tx: any, matchingPaths: any) {
    const newTx: any = {}

    matchingPaths.forEach((path: any) => {
        const keys = path.split('.')
        let source = tx
        const target = newTx

        keys.forEach((key: any, index: number) => {
            const isLastKey = index === keys.length - 1
            const arrayMatch = key.match(/^(\d+)$/) // Check if it's an array index

            if (arrayMatch) {
                // Handle array index
                const arrayIndex = parseInt(keys[index]) // Previous key is the array name
                const targetArrayId = keys[index - 1]

                if (!Array.isArray(target[targetArrayId])) {
                    target[targetArrayId] = []
                }

                source = source[arrayIndex]
                target[targetArrayId] = [
                    ...target[targetArrayId].filter((o: any) => !!o.matchedIndex),
                    { ...source, matchedIndex: arrayIndex },
                ]
            } else {
                // Regular key handling
                if (isLastKey) {
                    if (typeof source[key] === 'object' && source[key] !== null) {
                        target[key] = JSON.parse(JSON.stringify(source[key], customReplacer, 2)) // Deep copy
                    } else {
                        target[key] = source[key]
                    }
                } else {
                    if (!source[key]) {
                        source = source[key + 's']
                    } else {
                        source = source[key]
                    }
                    target[key] = source
                }
            }
        })
    })

    return newTx
}
