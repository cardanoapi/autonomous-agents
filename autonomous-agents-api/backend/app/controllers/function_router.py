from typing import List

from classy_fastapi import get
from fastapi import APIRouter

from backend.app.helper.function_metadata import functions_metadata

router = APIRouter()


@router.get("/functions", response_model=List)
async def get_functions():
    return functions_metadata
