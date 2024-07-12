import cbor2
import binascii
from nacl.signing import VerifyKey

def decode_cborhex_to_cborobj(hex_value):
    return cbor2.loads(binascii.unhexlify(hex_value))


def extract_signed_address_from_signature_header(hex_signature):
    data_obj = decode_cborhex_to_cborobj(hex_signature)
    decoded_header = decode_cborhex_to_cborobj(binascii.hexlify(data_obj[0]))
    
    if isinstance(decoded_header, dict) and 'address' in decoded_header:
        hex_header_address = binascii.hexlify(decoded_header['address'])
        return hex_header_address.decode('utf-8')
    else:
        raise ValueError("Invalid signature format or missing 'address' field in payload.")
    

def extract_payload_from_signature(hex_signature):
    data_obj = decode_cborhex_to_cborobj(hex_signature)
    if isinstance(data_obj[2] , bytes):
      return data_obj[2].decode('utf-8')
    else:
        raise ValueError('Invalid Data Payload in given Signature')
    

def extract_signature_from_signature(hex_signature):
    data_obj = decode_cborhex_to_cborobj(hex_signature)
    return binascii.hexlify(data_obj[3]).decode('utf-8')
    
def extract_public_key_from_key(hex_key):
    '''
     hex_key : key recieved in the Signed Data
    '''
    decoded_hex_key = decode_cborhex_to_cborobj(hex_key)
    return binascii.hexlify(decoded_hex_key[-2]).decode('utf-8')


def verify_ed25529_signature(signature , message , public_key):
    '''
     Signature : Hex (Signature of the Signature) 
     message : Hex (CoseSign1 Format)
     PublicKey : Hex
    '''
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
    
def convert_payload_to_cosSign1_format(hex_signature):
    '''
      Converts the Signature Payload to CosSign1 Format
    '''
    placeholder = 'Signature1'
    data_obj = decode_cborhex_to_cborobj(hex_signature)

    empty_byte_string = binascii.hexlify(b'')
    
    # Construct the cosSign1 format array
    coseSign1_message = [placeholder, data_obj[0], b'', data_obj[2]]
    
    return cbor2.dumps(coseSign1_message)


def verify_signed_data(hex_signature , hex_key):
    '''
     Extracts Signatues Signature
     Extracts Signature Payload and converts into cosSign1 Format
     Extracts Public Key from Hex Key
     Passes them all to verify_ed25529_signature function and returns the result
    '''
    signatures_signature = extract_signature_from_signature(hex_signature)
    signature_payload_cosSign1_fromat = convert_payload_to_cosSign1_format(hex_signature)
    public_key = extract_public_key_from_key(hex_key)
    return verify_ed25529_signature(signatures_signature , binascii.hexlify(signature_payload_cosSign1_fromat).decode() , public_key)
    

