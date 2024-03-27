import logging
import sys

logger = logging.getLogger()

formatter = logging.Formatter(
    fmt="%(asctime)s - %(levelname)s - %(message)s",  # added asctime for timestamp
    datefmt="%Y-%m-%d %H:%M:%S"  # specifying date format
)

#set handlers
stream_handler = logging.StreamHandler(sys.stdout)
file_handler = logging.FileHandler('app.log')

stream_handler.setFormatter(formatter)
file_handler.setFormatter(formatter)

#add handlers
logger.addHandler(stream_handler)  # adding handlers using addHandler method
logger.addHandler(file_handler)

#set log level
logger.setLevel(logging.INFO)