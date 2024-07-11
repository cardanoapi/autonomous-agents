import cbor2
import binascii
from nacl.signing import VerifyKey


def get_payload_address(signature):
    data_obj = decode_cborhex_to_cborobj(signature)
    decoded_payload = decode_cborhex_to_cborobj(binascii.hexlify(data_obj[0]))

    if isinstance(decoded_payload, dict) and "address" in decoded_payload:
        hex_payload_address = binascii.hexlify(decoded_payload["address"])
        return hex_payload_address.decode("utf-8")
    else:
        raise ValueError("Invalid signature format or missing 'address' field in payload.")


def decode_cborhex_to_cborobj(hex_value):
    return cbor2.loads(binascii.unhexlify(hex_value))


def verify_ed25519_signature(signature, message, public_key):
    """
    Signature : Hex
    message : Hex (CoseSign1 Format)
    PublicKey : Hex
    """
    try:
        decoded_public_key = bytes.fromhex(public_key)
        decoded_signature = bytes.fromhex(signature)
        decoded_messsage = bytes.fromhex(message)

        verify_key = VerifyKey(decoded_public_key)
        verify_key.verify(decoded_messsage, decoded_signature)

        return True
    except Exception as e:
        print(e)
        return False
