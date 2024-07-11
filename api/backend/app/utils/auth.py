import cbor2
import binascii


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
