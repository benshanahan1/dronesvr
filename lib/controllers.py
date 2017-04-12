from jinja2 import Environment, FileSystemLoader

from . util import DBFunc, UID, Timestamp, Web, Secure
from . globals import Session, Pages, App, Database

import random
import string
import cherrypy
import json

# Instantiate database query object
DB = DBFunc()  

# Names of database tables
DRONES = Database.DRONES_TABLE
ZONES = Database.ZONES_TABLE
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
        username = cherrypy.session.get(Session.AUTH_KEY)
        page_data = self._get_page_data()
        return tmpl.render(page_data)
    # About page
    @cherrypy.expose
    def about(self):
        tmpl = Environment(loader=FileSystemLoader(".")).get_template(Pages.TEMPLATE["about"])
        username = cherrypy.session.get(Session.AUTH_KEY)
        page_data = self._get_page_data()
        return tmpl.render(page_data)
    # Authorization page (login prompt)
    @cherrypy.expose
    def auth(self):
        tmpl = Environment(loader=FileSystemLoader(".")).get_template(Pages.TEMPLATE["auth"])
        username = cherrypy.session.get(Session.AUTH_KEY)
        if username is not None:
            if DB.check_permissions(username,0):
                raise Web.redirect(Pages.URL["index"])
            elif DB.check_permissions(username,1):
                raise Web.redirect(Pages.URL["super"])
            elif DB.check_permissions(username,2):
                raise Web.redirect(Pages.URL["admin"])
            else:  # unknown user_type; log user out
                cherrypy.session[Session.AUTH_KEY] = None
                raise Web.redirect(Pages.URL["auth"])
        else:
            page_data = self._get_page_data()
            return tmpl.render(page_data)
    # Supervisor landing page
    @cherrypy.expose
    def super(self):
        tmpl = Environment(loader=FileSystemLoader(".")).get_template(Pages.TEMPLATE["super"])
        username = cherrypy.session.get(Session.AUTH_KEY)
        if username is not None and DB.check_permissions(username,1):
            page_data = self._get_page_data()
            return tmpl.render(page_data)
        else:
            raise Web.redirect(Pages.URL["auth"])
    # Admin landing page (allows database modification)
    @cherrypy.expose
    def admin(self):
        tmpl = Environment(loader=FileSystemLoader(".")).get_template(Pages.TEMPLATE["admin"])
        username = cherrypy.session.get(Session.AUTH_KEY)
        if username is not None and DB.check_permissions(username,2):
            page_data = self._get_page_data()
            return tmpl.render(page_data)
        else:
            raise Web.redirect(Pages.URL["auth"])

    """ Functional endpoints """
    # Login endpoint (checks POSTed credentials and then redirects)
    # This page should send the current user to a landing page based on credentials
    @cherrypy.expose
    def login(self, username=None, password=None, **kwargs):
        if username is not None and password is not None:
            # escape username before changing database
            if Secure.credentials(username):
                # authenticate and redirect user given their credential type
                user_type = DB.get_user_type(username)
                if user_type >= 0 and user_type <= 2:
                    status = DB.authenticate_user(username,password,req_type=user_type)
                    print "here",status
                    if status:
                        cherrypy.session[Session.AUTH_KEY] = username
                        if user_type == 0:  # user
                            raise Web.redirect(Pages.URL["index"])
                        elif user_type == 1:  # supervisor
                            raise Web.redirect(Pages.URL["super"])
                        elif user_type == 2:  # administrator
                            raise Web.redirect(Pages.URL["admin"])
        cherrypy.session[Session.AUTH_KEY] = None
        raise Web.redirect(Pages.URL["auth"])
    # Logout endpoint (removes logged-in user session and redirects)
    @cherrypy.expose
    def logout(self):
        cherrypy.session[Session.AUTH_KEY] = None
        raise Web.redirect(Pages.URL["index"])
    # Add new delivery job
    @cherrypy.expose
    def addjob(self,flavor=None,destination=None):
        username = cherrypy.session.get(Session.AUTH_KEY)
        if DB.check_permissions(username,0) and \
           flavor is not None and destination is not None:
            # TODO: determine that flavor and destination 
            # values are valid (match pre-existing values)
            # Determine that user has not already queued a job
            if DB.user_can_queue(username):  # make sure user can queue a job!
                new_job = {
                    "uid": UID.generate("job"),  # generate random job UID
                    "username": username,
                    "flavor": flavor,
                    "destination": destination,
                    "timestamp": Timestamp.now()
                }
                success = DB.add_job(new_job)
                print "received",success
            else:
                print "Nope, you either have a job queued or already got a donut!"
        raise Web.redirect(Pages.URL["user"])

    """ Helper functions """
    # Return page_data dict to pass to Jinja template
    def _get_page_data(self):
        username = cherrypy.session.get(Session.AUTH_KEY)
        page_data = {
            "info": App.INFO
        }
        if username is not None:  # this means username exists and is valid
            page_data["username"] = username
            page_data["nickname"] = DB.get_user_info("nickname",username)
            page_data["email"] = DB.get_user_info("email",username)
            page_data["phone"] = DB.get_user_info("phone",username)
        return page_data