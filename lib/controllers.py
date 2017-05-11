from jinja2 import Environment, FileSystemLoader
from oauth2client import client, crypt

from . util import DBFunc, UID, Timestamp, Web, Secure
from . globals import Session, Pages, App, Database, Authentication

import random
import string
import cherrypy
import json
import re

# Instantiate database query object
DB = DBFunc()  

# Names of database tables
DRONES = Database.DRONES_TABLE
TYPES = Database.TYPES_TABLE

"""
The Controller class serves the requested page to the client (given a number of
criteria). It handles both the login-required administrative page and the realtime
user front-end of the site.
"""
class Controller(object):

    """ Landing pages """
    # Site index
    @cherrypy.expose
    def index(self):
        tmpl = Environment(loader=FileSystemLoader(".")).get_template(Pages.TEMPLATE["index"])
        page_data = self._get_page_data()
        return tmpl.render(page_data)
    # About page
    @cherrypy.expose
    def about(self):
        tmpl = Environment(loader=FileSystemLoader(".")).get_template(Pages.TEMPLATE["about"])
        page_data = self._get_page_data()
        return tmpl.render(page_data)
    # Account page
    @cherrypy.expose
    def account(self):
        page_data = self._get_page_data()
        userid = page_data["userid"]
        if userid is not None:
            tmpl = Environment(loader=FileSystemLoader(".")).get_template(Pages.TEMPLATE["account"])
            return tmpl.render(page_data)  # render page
        else:
            raise Web.redirect(Pages.URL["index"])  # reject user access

    """ Functional endpoints """
    # Login endpoint (checks POSTed credentials and then redirects)
    # This page should send the current user to a landing page based on credentials
    @cherrypy.expose
    def login(self, token=None):
        if token is None:
            Web.redirect(Pages.URL["index"])  # reject user login
        else:
            try:
                client_id = Authentication.CLIENT_ID
                idinfo = client.verify_id_token(token,client_id)
                if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                    raise crypt.AppIdentityError("Wrong issuer.")  # reject user login
            except crypt.AppIdentityError:
                # Invalid token
                raise Web.redirect(Pages.URL["index"])  # reject user login
            # Verify that domain belongs to @brown.edu
            domain = re.search("@[\w.]+",idinfo["email"])
            if domain.group() != Authentication.ALLOWED_USER_DOMAIN:
                # Reject user & wipe session data (just in case)
                cherrypy.session[Session.USERID] = ""
                cherrypy.session[Session.NAME] = ""
                raise Web.redirect(Pages.URL["index"])
            # check client_id and allow authentication if it matches
            if idinfo['aud'] == client_id:
                # token is valid and intended for client
                # get unique Google ID for user
                userid = idinfo['sub']
                cherrypy.session[Session.USERID] = userid  # unique google user id
                cherrypy.session[Session.NAME] = idinfo['name']
                # Check if the current user is already in our database, if not, add them
                if not DB._user_exists(userid):
                    DB.add_new_user(userid,idinfo['name'],idinfo['email'])
                return idinfo['name']
            else:
                raise Web.redirect(Pages.URL["index"])  # reject user login
    @cherrypy.expose
    def logout(self):
        cherrypy.session[Session.USERID] = None
        cherrypy.session[Session.NAME] = None
        raise Web.redirect(Pages.URL["index"])
    # Add new delivery job (this is an AJAX endpoint)
    @cherrypy.expose
    def addorder(self,flavor=None,destination=None):
        userid = cherrypy.session.get(Session.USERID)
        if DB.check_permissions(userid,0) and \
           flavor is not None and destination is not None:
            # TODO: determine that flavor and destination 
            # values are valid (match pre-existing values)
            # Determine that user has not already queued a job
            if DB.user_can_queue(userid):  # make sure user can queue a job!
                orderid = UID.generate("order")
                new_order = {
                    "uid": orderid,  # generate random job UID
                    "userid": userid,
                    "flavor": flavor,
                    "destination": destination,
                    "timestamp": Timestamp.now()
                }
                r1 = DB.add_order(new_order)
                r2 = DB.update_user_order(userid,orderid)
                return json.dumps({"success":True,"message":"Congrats! Your donut order will soon be on its way."})
            else:
                return json.dumps({"success":False,"message":"Sorry, you've already requested a donut!"})
        raise Web.redirect(Pages.URL["index"])
    # Internet Connectivity Demo
    @cherrypy.expose
    def demo(self):
        userid = cherrypy.session.get(Session.USERID)
        if userid is not None and DB.check_permissions(userid,2):
            tmpl = Environment(loader=FileSystemLoader(".")).get_template(Pages.TEMPLATE["demo"])
            page_data = self._get_page_data()
            return tmpl.render(page_data)
        else:
            raise Web.redirect(Pages.URL["index"])
    # Note: we don't use the API is so that the auth-key
    # for the drone remains concealed (if we do stuff server-side and 
    # directly interface with the database, we don't need it)
    @cherrypy.expose
    def set_command(self,drone_uid=None,command=None):
        userid = cherrypy.session.get(Session.USERID)
        if userid is not None and DB.check_permissions(userid,2):
            if drone_uid is not None and DB.uid_exists(drone_uid,DRONES) and command is not None:
                # TODO: verify that command is valid
                DB.set("command",command,"drones",drone_uid)
                drone_name = DB.get("name","drones",drone_uid)
                return "%s set to %s" % (drone_name,command)
        else:
            raise Web.redirect(Pages.URL["index"])

    """ Helper functions """
    # Return page_data dict to pass to Jinja template
    def _get_page_data(self):
        userid = cherrypy.session.get(Session.USERID)
        page_data = {
            "info": App.INFO
        }
        if userid is not None:  # this means userid exists and is valid
            page_data["userid"] = userid
            page_data["usertype"] = DB.get_user_info("type",userid)
            page_data["name"] = DB.get_user_info("name",userid)
            page_data["email"] = DB.get_user_info("email",userid)
            page_data["order"] = DB.get_user_info("order",userid)
            page_data["drone_uids"] = DB.get_all("uid",DRONES)
        else:
            page_data["userid"] = ""
            page_data["name"] = ""
            page_data["email"] = ""
            page_data["email"] = ""
            page_data["order"] = ""
        return page_data