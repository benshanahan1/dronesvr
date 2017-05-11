class Configuration:
    CONFIG_PATH = "config/app.config"
    SOCKET_HOST = "0.0.0.0"
    SOCKET_PORT = 80
    THREAD_POOL = 12
    ERROR_LOG_PATH = "log/error.log"
    ACCESS_LOG_PATH = "log/access.log"

# Generic Javascript HTML injection
class Inject:
    # Redirect user to site root (useful for 404 or 500 errors)
    INDEX_REDIRECT = "<html><body><script>window.location.replace('/');</script></body></html>"

class App:
    INFO = {
        "name": "lunadrop",
        "version": "v1.0",
        "authors": "Benjamin Shanahan & Isaiah Brand",
        "author_emails": "benjamin_shanahan@brown.edu, brand@brown.edu",
        "full_url": "http://lunadrop.com/",
        "short_url": "lunadrop.com",
        "description": "Autonomous Drone Delivery",
        "long_description": """lunadrop Autonomous Drone Delivery System"""
    }

class Database:
    DRONES_TABLE = "drones"
    TYPES_TABLE = "types"
    ORDERS_TABLE = "orders"
    TASKS_TABLE = "tasks"
    USERS_TABLE = "user"

class Authentication:
    CLIENT_ID = "680157324579-1ugiegjdfjqula183h6933tntfsrs7ph.apps.googleusercontent.com"
    ALLOWED_USER_DOMAIN = "@brown.edu"  # only allow @brown.edu Google users

class UIDConst:
    LENGTH = 7  # total length, NOT including hardcoded values below
    DRONE_ID = "D"  # at beginning of each drone UID
    TYPE_ID = "T"  # at beginning of each type UID
    ORDER_ID = "O"  # at beginning of each order UID  
    TASK_ID = "K"  # at beginning of each task UID

class Pages:
    # Path to template file
    TEMPLATE = {
        "index": "view/page/index.html",
        "about": "view/page/about.html",
        "account": "view/page/account.html",
        "demo": "view/page/demo.html"
    }
    # URL to page
    URL = {
        "index": "/",
        "about": "/about",
        "account": "/account",
        "demo": "/demo"
    }

class Session:
    USERID = "_userid"
    NAME = "_name"

class Errors:
    GENERIC = {
        "general": "An error occurred",
        "no_data": "No data was received"
    }
    JOB = {
        "no_queue": "Job failed to queue",
        "duplicate": "Job with that UID already exists"
    }
    API = {
        "general": "An error occurred while contacting endpoint",
    }
    DATABASE = {
        "general": "An error occurred during database connection",
        "bad_query": "Unable to process query",
    }
