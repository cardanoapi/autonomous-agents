import { bech32 } from 'bech32'
import AppError from '../errors/AppError'

export function convertToHexIfBech32(address: string): string {
    if (!address) return ''
    if (address.startsWith('stake') || address.startsWith('drep') || address.startsWith('gov_action')) {
        const decoded = bech32.decode(address)
        const data = bech32.fromWords(decoded.words)
        return Buffer.from(data).toString('hex')
    } else if (address.length === 58 && (address.startsWith('22') || address.startsWith('23'))) {
        return address.slice(2)
    }
    return address
}

export function decodeDrep(address: string): { credential: string; isScript?: boolean } {
    const drep = decodeAddress(address)
    if (drep.bech32Prefix === 'drep_script') {
        return {
            credential: drep.credential.toString('hex'),
            isScript: true,
        }
    } else {
        if (drep.dataHeader.length > 1) {
            throw new AppError('Drep credential contains invalid header: ' + address)
        }
        let isScript
        const header = drep.dataHeader.at(0)
        if (header == 0x22) {
            isScript = false
        } else if (header == 0x23) {
            isScript = true
        } else if (header) {
            throw new AppError('Drep credential contains invalid header 0x' + header.toString(16) + ': ' + address)
        }
        return {
            credential: drep.credential.toString('hex'),
            isScript: isScript,
        }
    }
}

export function encodeDrep(hexValue: string, isScript: boolean) {
    try {
        let drepHexVal = hexValue
        if (isScript) {
            drepHexVal = '23' + drepHexVal
        } else {
            drepHexVal = '22' + drepHexVal
        }
        const drepBufferVal = Buffer.from(drepHexVal, 'hex')
        const bech32Words = bech32.toWords(drepBufferVal)
        return bech32.encode(isScript ? 'drep_script' : 'drep', bech32Words, 100)
    } catch (e: any) {
        throw new AppError(e?.message || 'Error During DrepViewConversion: ', e)
    }
}

export function decodeAddress(address: string): { bech32Prefix: string; dataHeader: Buffer; credential: Buffer } {
    if (!address) return { bech32Prefix: '', dataHeader: Buffer.alloc(0), credential: Buffer.alloc(0) } // Return empty if address is falsy

    if (isHexValue(address)) {
        // Handle the case where the address is hex-encoded (you can tweak this based on your needs)
        const buffer = Buffer.from(address, 'hex')
        const dataHeader = buffer.subarray(0, buffer.length - 28)
        const credential = buffer.subarray(buffer.length - 28)
        return { bech32Prefix: 'hex', dataHeader, credential }
    } else {
        try {
            // Decode the Bech32 address
            const decoded = bech32.decode(address)
            const data = bech32.fromWords(decoded.words)
            const buffer = Buffer.from(data)

            // Split the buffer into header and credential (last 28 bytes for credential)
            const dataHeader = buffer.subarray(0, buffer.length - 28)
            const credential = buffer.subarray(buffer.length - 28)

            return {
                bech32Prefix: decoded.prefix, // Extract prefix from the Bech32 decoding result
                dataHeader,
                credential,
            }
        } catch (e: any) {
            throw new AppError('Data is not hex or bech32: ' + address)
        }
    }
}

export function isHexValue(value: string): boolean {
    const hexRegex = /^(?:[0-9a-fA-F]{56}|[0-9a-fA-F]{58})$/
    return hexRegex.test(value)
}

export function validateHash(value: string) {
    const regex = /^[a-f0-9A-F]{64}$/
    if (value.includes('#')) {
        return regex.test(value.split('#')[0])
    } else return regex.test(value)
}

export function fromHex(prefix: string, hex: string) {
    return bech32.encode(prefix, bech32.toWords(Buffer.from(hex, 'hex')))
}

export function validateAddress(value: string): boolean {
    if (isHexValue(value)) {
        return value.length === 56 || value.length === 58
    }
    return false
}

export function formatProposal(proposal: string) {
    try{
        if (proposal.startsWith('gov_action')) {
            const decoded = bech32.decode(proposal)
            const data = bech32.fromWords(decoded.words)
            const hex = Buffer.from(data).toString('hex')
            return { id: hex.slice(0, 64), ix: parseInt(hex.slice(64)) }
        } else if (validateHash(proposal)) {
            const splitFromHash = proposal.split('#')
            return { id: splitFromHash[0], ix: parseInt(splitFromHash[1]) }
        }
    }catch(error:any){
        throw new AppError('GovAction is neither hex nor bech32: ' + proposal)
    }
}