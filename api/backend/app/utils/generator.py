import base64
import random
import string


def generate_random_string(length):
    char_set = string.ascii_letters + string.digits
    random_string = "".join(random.choice(char_set) for _ in range(length))
    return random_string


def generate_random_base64(length):
    random_string = generate_random_string(length).encode("utf-8")
    return base64.b64encode(random_string).decode("utf-8")
