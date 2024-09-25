from classy_fastapi import get, Routable
from fastapi_pagination import Page

from backend.app.services.drep_service import DrepService


class DrepRouter(Routable):
    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.drep_service = DrepService()

    @get("/dreps", response_model=Page)
    async def get_all_dreps(self, page: int = 1, pageSize: int = 10, drep_type: str = "all", search: str | None = None):
        if drep_type == "internal":
            [dreps, total_count] = await self.drep_service.fetch_internal_dreps(page, pageSize, search)
            return Page(items=dreps, total=total_count, page=page, size=pageSize, pages=1)
        else:
            drep_data = await self.drep_service.fetch_external_dreps(page, pageSize, search)

            print(drep_data)
            return Page(
                items=drep_data["items"],
                total=drep_data["total"],
                page=drep_data["page"],
                size=drep_data["size"],
                pages=drep_data["pages"],
            )
