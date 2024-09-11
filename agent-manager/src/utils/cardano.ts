import { HdKey } from 'libcardano'
import environments from '../config/environments'

export async function generateRootKey(index = 0) {
    const mnemonicKey = await HdKey.fromMnemonicString(environments.agentMnemonic)
    return (await mnemonicKey.child(index, true)).bytes()
}
