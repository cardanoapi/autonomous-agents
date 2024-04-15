import random
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from actions import Add, Sub

# Create an instance of AsyncIOScheduler
scheduler = AsyncIOScheduler()

def probabilistic_wrapper(action_func, params, probability):
    def wrapper():
        if random.random() <= probability:
            result = action_func(*params)
            print(f"Action executed with result: {result}")
        else:
            print(f"Action skipped due to probability check: {probability}")
    return wrapper


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
        parameters = action_data.get("parameter", "").split(",")  # Convert parameters to a list of arguments

        # Schedule the action function using a CronTrigger and probabilistic for triggering the function
        wrapper_function = probabilistic_wrapper(action_func, parameters, probability)
        scheduler.add_job(
            wrapper_function,
            trigger=CronTrigger.from_crontab(cron_expression)
        )

    # Start the scheduler if not already running
    if not scheduler.running:
        scheduler.start()
