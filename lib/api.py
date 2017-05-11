from . globals import Database
from . util import DBFunc

import cherrypy
import json

# Instantiate database query object
DB = DBFunc()  

# Names of database tables
DRONES = Database.DRONES_TABLE
ORDERS = Database.ORDERS_TABLE
TYPES = Database.TYPES_TABLE
TASKS = Database.TASKS_TABLE

""" The API object enables realtime requests of drone state """
@cherrypy.expose
class API(object):

    """ Return JSON array of information to authorized client when requested """
    @cherrypy.tools.accept(media="application/json")
    def GET(self, drone_uid=None, order_uid=None, subset=None):

        # If UID is specified, return information specific to that UID. If UID is
        # specified, information contained in subset will be returned to client.
        # Possible options are:
        #    position, type, zone, all, None (returns command)
        if drone_uid is not None and DB.uid_exists(drone_uid,DRONES):
            
            def _get_position(drone_uid):
                return {
                    "latitude": DB.get("latitude",DRONES,drone_uid),
                    "longitude": DB.get("longitude",DRONES,drone_uid),
                    "altitude": DB.get("altitude",DRONES,drone_uid),
                    "speed": DB.get("speed",DRONES,drone_uid),
                    "timestamp": DB.get("timestamp",DRONES,drone_uid)
                }

            def _get_type(drone_uid):
                type_uid = DB.get("type",DRONES,drone_uid)
                return {
                    "maxpayload": DB.get("maxpayload",TYPES,type_uid),
                    "minvoltage": DB.get("minvoltage",TYPES,type_uid),
                    "topspeed": DB.get("topspeed",TYPES,type_uid),
                    "description": DB.get("description",TYPES,type_uid)
                }

            def _get_task(drone_uid):
                task_uid = DB.get("task",DRONES,drone_uid)
                return {
                    "uid": DB.get("uid",TASKS,task_uid),
                    "drone": DB.get("drone",TASKS,task_uid),
                    "orders": DB.get("orders",TASKS,task_uid),
                    "mission": DB.get("mission",TASKS,task_uid),
                    "completed": DB.get("completed",TASKS,task_uid)
                }

            def _get_mission(drone_uid):
                return {
                    "activemission": DB.get("activemission",DRONES,drone_uid)
                }

            def _get_command(drone_uid):
                return {"command": DB.get("command",DRONES,drone_uid)}

            def _get_state(drone_uid):
                task_uid = DB.get("task",DRONES,drone_uid)
                order_uid = DB.get("orders",TASKS,task_uid)  # TODO: implement for multiple orders!
                return {
                    "command": DB.get("command",DRONES,drone_uid),
                    "status": DB.get("status",DRONES,drone_uid),
                    "error": DB.get("error",DRONES,drone_uid),
                    "voltage": DB.get("voltage",DRONES,drone_uid),
                    "activemission": DB.get("activemission",DRONES,drone_uid),
                    "contains": DB.get("flavor",ORDERS,order_uid)
                }

            def _get_general(drone_uid):
                return {
                    "name": DB.get("name",DRONES,drone_uid),
                    "description": DB.get("description",DRONES,drone_uid)
                }

            # Return requested subset to client
            cherrypy.response.status = 200  # OK
            if subset is None:
                # Return command
                return json.dumps(_get_command(drone_uid))
            elif subset == "position":
                # Return information related to drone position
                return json.dumps(_get_position(drone_uid))
            elif subset == "type":
                # Return information related to drone type
                return json.dumps(_get_type(drone_uid))
            elif subset == "mission":
                # Return information related to drone active mission
                return json.dumps(_get_mission(drone_uid))
            elif subset == "task":
                # Return information related to drone's current job
                return json.dumps(_get_task(drone_uid))
            elif subset == "state":
                # Return information related to drone state
                return json.dumps(_get_state(drone_uid))
            elif subset == "general":
                # Return general drone information
                return json.dumps(_get_general(drone_uid))
            else:
                return "{}"

        # Return information specific to given order_uid
        elif order_uid is not None and DB.uid_exists(order_uid,ORDERS):

            # Return status of drone corresponding to given order_uid
            def _get_status(order_uid):
                task_uid = DB.get("task",ORDERS,order_uid)
                drone_status = "unassigned"
                if task_uid:
                    drone_uid = DB.get("drone",TASKS,task_uid)
                    drone_status = DB.get("status",DRONES,drone_uid)
                return {"status": drone_status}

            # Return requested subset to client
            cherrypy.response.status = 200  # OK
            if subset is None:
                # Return command
                return json.dumps(_get_status(order_uid))

        # If no UID is specified, return a list of all drone UIDs
        else:
            
            uids = DB.get_all("uid",DRONES)
            ret = {"uids":[]}
            for u in uids:
                ret["uids"].append(u[0])
            cherrypy.response.status = 200  # OK
            return json.dumps(ret)

    """ Parse drone state (JSON array) from authorized client and updated database """
    def POST(self, drone_uid=None, auth=None, state=None):
        if drone_uid is not None and auth is not None and state is not None \
        and DB.uid_exists(drone_uid,DRONES) and DB.authorized(drone_uid,auth):
            # Determine which values are included in state (allows partial updates)
            # and then only update those values
            state = json.loads(state)  # convert to dictionary
            for key, value in state.iteritems():
                DB.set(key, value, DRONES, drone_uid)
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