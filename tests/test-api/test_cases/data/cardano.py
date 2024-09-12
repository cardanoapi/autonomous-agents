from models.cardano import SignedData
import os
import sys


def get_signed_data(signature_env_var: str, key_env_var: str) -> SignedData:
    signature = os.getenv(signature_env_var)
    key = os.getenv(key_env_var)

    if not signature or not key:
        raise ValueError(
            f"Environment variables {signature_env_var} and {key_env_var} must be set and non-empty."
        )

    return SignedData(signature=signature, key=key)


try:

    print(os.getenv("ADMIN_SIGNATURE"))
    print(os.getenv("ADMIN_KEY"))

    admin_signed_data = get_signed_data("ADMIN_SIGNATURE", "ADMIN_KEY")
    user_signed_data = get_signed_data("USER_SIGNATURE", "USER_KEY")
except ValueError as e:
    print(f"Error: {e}")
    sys.exit(1)
