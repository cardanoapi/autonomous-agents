import { bech32 } from "bech32";

export function convertToHexIfBech32(address: string): string {
  if (!address) return ''
  if (address.includes('stake')|| address.includes('drep')){
    const decoded = bech32.decode(address);
    const data = bech32.fromWords(decoded.words);
    return Buffer.from(data).toString('hex');
  }
  else if (address.length === 58 && (address.startsWith('22') || address.startsWith('23'))){
    return address.slice(2)
  }
  return address
}

export function isHexValue(value:string):boolean{
  const hexRegex = /^(?:[0-9a-fA-F]{56}|[0-9a-fA-F]{58})$/;
  return hexRegex.test(value);
}

export function validateHash(value:string) {
  const regex = /^[a-f0-9A-F]{64}$/
  if (value.includes('#')){
    return regex.test(value.slice(0,-2))
  }else return regex.test(value)
}

export function fromHex(prefix: string, hex: string) {
  return bech32.encode(prefix, bech32.toWords(Buffer.from(hex, "hex")));
}

export function validateAddress(value: string): boolean {
  if (isHexValue(value)){
    return value.length === 56 || value.length === 58
  }
  return false
}
