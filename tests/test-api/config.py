import os
import dotenv

dotenv.load_dotenv()

AUTONOMOUS_AGENTS_API = os.getenv("AUTONOMOUS_AGENTS_API", "http://localhost:8000")
