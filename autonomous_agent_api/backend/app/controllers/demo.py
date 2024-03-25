from fastapi import APIRouter
from fastapi import status

router = APIRouter(tags=['test'])

@router.get('/ping' , status_code=status.HTTP_200_OK)
async def test_api():
    return {"status" : "Success"}