# # container.py
#
# from dependency_injector import containers, providers
# from backend.app.repositories.agent_repository import AgentRepository
# from backend.app.services.agent_service import AgentService
#
# class Container(containers.DeclarativeContainer):
#     config = providers.Configuration()
#
#     agent_repository = providers.Singleton(AgentRepository)
#     agent_service = providers.Singleton(AgentService, agent_repository=agent_repository)
#
#
# Container.config({
#     "database_url": "postgresql://root:root@localhost:5432/cardano_autonomous_agent_testing_db"
# })