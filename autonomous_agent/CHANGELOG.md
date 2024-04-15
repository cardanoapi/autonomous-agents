# Changelog

  - Setup websocket client for autonomous agent service 

# Modularized Code , DATE - 2024-04-12
 - previously the whole code was written in single file called connect-agent.py
 - Now, Created seprate files for 
   - connection handler, which contains the function for connecting the server and send ping to server
   - config handler - which handles the receives message basically config from server and Ping message
   - action - it contains the function which is need to be called according to configuration fetch from the server 
   - schedule - it runs the function fetch from action included in configuration according to cron expression 
 -install apscheduler for schedling function 