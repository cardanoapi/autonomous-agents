import random
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from actions import Add, Sub

# Create an instance of AsyncIOScheduler
scheduler = AsyncIOScheduler()

def schedule_actions(config_data):
    # Remove existing jobs from the scheduler
    scheduler.remove_all_jobs()

    # Schedule actions based on the configurations
    for config in config_data.get("configurations", []):
        # Retrieve the action and data from the configuration
        action_data = config.get("action", {})
        data = config.get("data", {})
        probability = data.get("probability", 1.0)

        # Determine which action function to schedule (e.g., Add, Sub)
        function_name = action_data.get("function_name")
        if function_name == "Add":
            action_func = Add
        elif function_name == "Sub":
            action_func = Sub
        else:
            continue  # Skip unknown function names

        # Retrieve the cron expression and parameters for the action function
        cron_expression = data.get("frequency")
        parameters = action_data.get("parameter", "")
        # Check probability before scheduling the job
        if random.random() <= probability:
            # Schedule the action function using a CronTrigger
            scheduler.add_job(
                action_func,
                trigger=CronTrigger.from_crontab(cron_expression),
                args=parameters.split(",")  # Convert parameters to a list of arguments
            )

    # Start the scheduler if not already running
    if not scheduler.running:
        scheduler.start()
