from requests import Response, Session
from typing import Any
import json


class AutonomousAgentApi:

    def __init__(self, base_url: str) -> None:
        self._base_url = base_url
        self._session = Session()
        self._session.headers.update(
            {"Accept": "application/json", "Content-Type": "application/json"}
        )
        self.requests_log = []

    def _request(
        self,
        method: str,
        endpoint: str,
        param: Any | None = None,
        body: Any | None = None,
        headers: dict | None = None,
    ) -> Response:
        endpoint = endpoint if endpoint.startswith("/") else f"/{endpoint}"
        full_url = self._base_url + endpoint
        full_url_with_parms = full_url + "/" + param if param else full_url

        response = self._session.request(
            method=method, url=full_url_with_parms, json=body, headers=headers
        )

        try:
            response_json = response.json()
            response_json_str = json.dumps(response_json)[:200]
        except:
            response_json_str = "Response not as Expected. Something is Wrong"

        request_info = {
            "method": method,
            "endpoint": endpoint,
            "path_param": param,
            "json": json.dumps(body),
            "status_code": response.status_code,
            "response_json": response_json_str,
        }

        self.requests_log.append(request_info)

        assert (
            200 <= response.status_code <= 299
        ), f"Expected {method} {endpoint} to succeed but got statusCode: {response.status_code} : body: {response.text}"

        return response

    def _get(
        self, endpoint: str, param: str | None = None, headers: dict | None = None
    ) -> Response:
        return self._request(
            method="GET", endpoint=endpoint, param=param, headers=headers
        )

    def _put(
        self,
        endpoint: str,
        param: str | None = None,
        headers: dict | None = None,
        body: Any | None = None,
    ) -> Response:
        return self._request(
            method="PUT", endpoint=endpoint, param=param, headers=headers, body=body
        )

    def _post(
        self,
        endpoint: str,
        param: str | None = None,
        body: Any | None = None,
        headers: dict | None = None,
    ) -> Response:
        return self._request(
            method="POST", endpoint=endpoint, param=param, body=body, headers=headers
        )

    def _delete(
        self,
        endpoint: str,
        param: str | None = None,
        headers: dict | None = None,
        body: Any | None = None,
    ) -> Response:
        return self._request(
            method="DELETE", endpoint=endpoint, param=param, headers=headers, body=body
        )

    def agents_list(self, headers: dict | None = None) -> Response:
        return self._get("/agents", headers=headers)

    def create_agent(
        self, headers: dict | None = None, body: Any | None = None
    ) -> Response:
        return self._post("/agents", headers=headers, body=body)

    def edit_agent(
        self, agentID: str, headers: dict | None = None, body: Any | None = None
    ) -> Response:
        return self._put(f"/agents/{agentID}", headers=headers, body=body)

    def get_agent(self, agentID: str, headers: dict | None = None) -> Response:
        return self._get(f"/agent/{agentID}", headers=headers)

    def delete_agent(self, agentID: str, headers: dict | None = None) -> Response:
        return self._delete(f"/agents/{agentID}", headers=headers)

    def my_agent(self, headers: dict | None = None) -> Response:
        return self._get("/my-agent", headers=headers)

    def agent_manual_trigger(
        self, agentID: str, headers: dict | None = None, body: Any | None = None
    ) -> Response:
        return self._post(f"/agents/{agentID}/trigger", headers=headers, body=body)

    def templates_list(self, headers: dict | None = None) -> Response:
        return self._get("/templates", headers=headers)

    def create_template(
        self, headers: dict | None = None, body: Any | None = None
    ) -> Response:
        return self._post("/templates", headers=headers, body=body)

    def get_template(self, template_id, headers: dict | None = None) -> Response:
        return self._get(f"/templates/{template_id}", headers=headers)

    def edit_template(
        self, template_id, headers: dict | None = None, body: Any | None = None
    ) -> Response:
        return self._put(f"/templates/{template_id}", headers=headers, body=body)

    def delete_template(self, template_id, headers: dict | None = None) -> Response:
        return self._delete(f"/templates/{template_id}", headers=headers)

    def get_trigger_history_by_agent_id(
        self,
        agent_id,
    ) -> Response:
        return self._get(f"/trigger-history?agent_id={agent_id}")

    def login_user(self, body: Any) -> Response:
        return self._post("/auth/login", body=body)

    def logout_user(self, headers: dict | None = None) -> Response:
        return self._post("/auth/logout", headers=headers)
