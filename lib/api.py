from . globals import Database
from . util import DBFunc

import cherrypy
import json

# Instantiate database query object
DB = DBFunc()  

# Names of database tables
DRONES = Database.DRONES_TABLE
ZONES = Database.ZONES_TABLE
TYPES = Database.TYPES_TABLE
TASKS = Database.TASKS_TABLE

""" The API object enables realtime requests of drone state """
@cherrypy.expose
class API(object):

    """ Return JSON array of information to authorized client when requested """
    @cherrypy.tools.accept(media="application/json")
    def GET(self, uid=None, subset=None):
        # If UID is specified, return information specific to that UID. If UID is
        # specified, information contained in subset will be returned to client.
        # Possible options are:
        #    position, type, zone, all, None (returns command)
        if uid is not None and DB.uid_exists(uid,DRONES):
            
            def _get_position(uid):
                return {
                    "latitude": DB.get("latitude",DRONES,uid),
                    "longitude": DB.get("longitude",DRONES,uid),
                    "altitude": DB.get("altitude",DRONES,uid),
                    "speed": DB.get("speed",DRONES,uid),
                    "timestamp": DB.get("timestamp",DRONES,uid)
                }

            def _get_type(uid):
                type_uid = DB.get("type",DRONES,uid)
                return {
                    "maxpayload": DB.get("maxpayload",TYPES,type_uid),
                    "minvoltage": DB.get("minvoltage",TYPES,type_uid),
                    "topspeed": DB.get("topspeed",TYPES,type_uid),
                    "description": DB.get("description",TYPES,type_uid)
                }

            def _get_zone(uid):
                zone_uid = DB.get("zone",DRONES,uid)
                return {
                    "latitude": DB.get("latitude",ZONES,zone_uid),
                    "longitude": DB.get("longitude",ZONES,zone_uid),
                    "altitude": DB.get("altitude",ZONES,zone_uid),
                    "description": DB.get("description",ZONES,zone_uid)
                }

            def _get_task(uid):
                task_uid = DB.get("task",DRONES,uid)
                return {
                    "uid": DB.get("uid",TASKS,task_uid),
                    "drone": DB.get("drone",TASKS,task_uid),
                    "orders": DB.get("orders",TASKS,task_uid),
                    "departuretime": DB.get("departuretime",TASKS,task_uid),
                    "arrivaltime": DB.get("arrivaltime",TASKS,task_uid)
                }

            def _get_command(uid):
                return {"command": DB.get("command",DRONES,uid)}

            def _get_state(uid):
                return {
                    "command": DB.get("command",DRONES,uid),
                    "status": DB.get("status",DRONES,uid),
                    "error": DB.get("error",DRONES,uid),
                    "voltage": DB.get("voltage",DRONES,uid)
                }

            def _get_general(uid):
                return {
                    "name": DB.get("name",DRONES,uid),
                    "description": DB.get("description",DRONES,uid)
                }

            def _get_all(uid):
                return {
                    "position": _get_position(uid),
                    "type": _get_type(uid),
                    "zone": _get_zone(uid),
                    "state": _get_state(uid),
                    "general": _get_general(uid)
                }

            # Return requested subset to client
            cherrypy.response.status = 200  # OK
            if subset is None:
                # Return command
                return json.dumps(_get_command(uid))
            elif subset == "position":
                # Return information related to drone position
                return json.dumps(_get_position(uid))
            elif subset == "type":
                # Return information related to drone type
                return json.dumps(_get_type(uid))
            elif subset == "zone":
                # Return information related to drone current/previous zone (TODO clarify)
                return json.dumps(_get_zone(uid))
            elif subset == "task":
                # Return information related to drone's current job
                return json.dumps(_get_task(uid))
            elif subset == "state":
                # Return information related to drone state
                return json.dumps(_get_state(uid))
            elif subset == "general":
                # Return general drone information
                return json.dumps(_get_general(uid))
            elif subset == "all":
                # Return all information
                return json.dumps(_get_all(uid))
            else:
                return "{}"

        else:  # if no UID is specified, return a list of all drone UIDs
            
            uids = DB.get_all("uid",DRONES)
            ret = {"uids":[]}
            for u in uids:
                ret["uids"].append(u[0])
            cherrypy.response.status = 200  # OK
            return json.dumps(ret)

    """ Parse drone state (JSON array) from authorized client and updated database """
    def POST(self, uid=None, auth=None, state=None):
        if uid is not None and auth is not None and state is not None \
        and DB.uid_exists(uid,DRONES) and DB.authorized(uid,auth):
            # Determine which values are included in state (allows partial updates)
            # and then only update those values
            state = json.loads(state)  # convert to dictionary
            for key, value in state.iteritems():
                DB.set(key, value, DRONES, uid)
            cherrypy.response.status = 201  # Created
            return json.dumps(state)
        else:
            cherrypy.response.status = 401  # Unauthorized
            return "Unauthorized"

    """ Queue new order (user request for a drone pickup / dropoff) """
    def PUT(self, username=None, password=None, order=None):
        if username is not None and password is not None:
            # Authenticate username and password. Allow all credential types (user,mod,admin).
            if DB.authenticate_user(username,password):
                if order is not None:
                    # Parse the order
                    order = json.loads(order)  # JSON string to dict
                    uid = order["uid"]  # have the UID handy
                    # Check that the UID doesn't exist in the queue already
                    if not DB.uid_exists(uid,QUEUE):
                        DB.queue_order(order)  # queue the order
                        cherrypy.response.status = 201  # item queued
                        return json.dumps(order)  # echo back to client what was just PUT
                    else:
                        cherrypy.response.status = 409  # conflict
                        return "Queue order already exists with UID ({}).".format(uid)
                else:
                    cherrypy.response.status = 200  # OK
                    return "No order received."
        cherrypy.response.status = 401  # unauthorized
        return "Unauthorized"