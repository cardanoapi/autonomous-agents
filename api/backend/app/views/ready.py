"""Application implementation - ready response."""

from typing import Any, Dict, Optional

from pydantic import BaseModel


class ReadyResponse(BaseModel):
    """Define ready response model.

    Attributes:

    Raises:
        pydantic.error_wrappers.ValidationError: If any of provided attribute
            doesn't pass type validation.

    """

    message: Any

    class Config:
        """Config sub-class needed to extend/override the generated JSON schema.

        More details can be found in pydantic documentation:
        https://pydantic-docs.helpmanual.io/usage/schema/#schema-customization

        """

        @staticmethod
        def schema_extra(schema: Dict[str, Any]) -> None:
            """Post-process the generated schema.

            Method can have one or two positional arguments. The first will be
            the schema dictionary. The second, if accepted, will be the model
            class. The callable is expected to mutate the schema dictionary
            in-place; the return value is not used.

            Args:
                schema (typing.Dict[str, typing.Any]): The schema dictionary.

            """
            # Override schema description, by default is taken from docstring.
            schema["description"] = "Ready response model."
