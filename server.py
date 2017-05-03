from lib.controllers import Controller
from lib.api import API
from lib.globals import Configuration, Database, Inject

import ConfigParser
import os
import MySQLdb
import cherrypy

# TODO: replace this with an environment variable?
CURRDIRR = os.path.dirname(os.path.abspath(__file__))

def get_app(conf):
    app = Controller()
    app.api = API()
    cherrypy.tree.mount(app, "/", config=conf)
    global_config = {
        "engine.autoreload.on": True,
        "server.socket_host":   Configuration.SOCKET_HOST,
        "server.socket_port":   Configuration.SOCKET_PORT,
        "server.thread_pool":   Configuration.THREAD_POOL,
        "log.error_file":       Configuration.ERROR_LOG_PATH,
        "log.access_file":      Configuration.ACCESS_LOG_PATH,
        "error_page.404":       error_404,
        "error_page.500":       error_500
    }
    cherrypy.config.update(global_config)
    return cherrypy.tree

def new_thread(thread_index):
    cfg = ConfigParser.ConfigParser()
    cfg.read("config/db.keys")  # parse .keys file in config/ dir
    cherrypy.thread_data.db = MySQLdb.connect(
        cfg.get("Database","host"), 
        cfg.get("Database","user"), 
        cfg.get("Database","password"),
        cfg.get("Database","database"))

def secure_headers():
    headers = cherrypy.response.headers
    headers["x-frame-options"] = "deny"
    headers["x-xss-protection"] = "1; mode=block"
    headers["x-content-type-options"] = "nosniff"

def error_404(status,message,traceback,version):
    return Inject.INDEX_REDIRECT
    
def error_500(status,message,traceback,version):
    error_data = {
        "code": code,
        "status": status,
        "message": message,
        "traceback": traceback,
        "version": version
    }
    print "###### AN ERROR OCCURRED ######"
    print status
    print message
    print "###############################"
    return Inject.INDEX_REDIRECT

def start():
    get_app(Configuration.CONFIG_PATH)
    cherrypy.tools.secureheaders = cherrypy.Tool("before_finalize", secure_headers, priority=60)
    cherrypy.engine.signals.subscribe()
    cherrypy.engine.subscribe("start_thread", new_thread)
    cherrypy.engine.start()
    cherrypy.engine.block()



if __name__ == "__main__":
    start()