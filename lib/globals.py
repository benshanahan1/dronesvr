class Configuration:
    CONFIG_PATH = "config/app.config"
    SOCKET_HOST = "0.0.0.0"
    SOCKET_PORT = 80
    THREAD_POOL = 12
    ERROR_LOG_PATH = "log/error.log"
    ACCESS_LOG_PATH = "log/access.log"

class App:
    INFO = {
        "name": "LunaDrop",
        "version": "v1.0",
        "authors": "Benjamin Shanahan, Izzy Brand",
        "author_emails": "benjamin_shanahan@brown.edu, brand@brown.edu",
        "full_url": "http://lunadrop.com/",
        "short_url": "lunadrop.com",
        "description": "LunaDrop Autonomous Delivery",
        "long_description": """long description here"""
    }

class Database:
    HOST = "localhost"
    USER = "root"
    PASSWORD_ENV_VAR = "DRONE_DB_PWD"  # name of environmental variable
    DATABASE_NAME = "dronedb"
    DRONES_TABLE = "drones"
    ZONES_TABLE = "zones"
    TYPES_TABLE = "types"
    JOBS_TABLE = "jobs"
    USERS_TABLE = "user"

class UIDConst:
    LENGTH = 7  # total length, NOT including hardcoded values below
    DRONE_ID = "D"  # at beginning of each drone UID
    ZONE_ID = "Z"  # at beginning of each zone UID
    TYPE_ID = "T"  # at beginning of each type UID
    JOB_ID = "J"  # at beginning of each job UID  
    USER_ID = "U"  # at beginning of each user UID

class Pages:
    # Path to template file
    TEMPLATE = {
        "index": "view/page/index.html",
        "about": "view/page/about.html",
        "auth": "view/page/auth.html",
        "super": "view/page/super.html",
        "admin": "view/page/admin.html"
    }
    # URL to page
    URL = {
        "index": "/",
        "about": "/about",
        "auth": "/auth",
        "super": "/super",
        "admin": "/admin"
    }

class Session:
    AUTH_KEY = "_username"

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
