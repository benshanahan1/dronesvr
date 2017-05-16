from . globals import UIDConst, Errors, Database
from dateutil import parser

import string
import random
import datetime
import cherrypy
import hashlib
import re


"""Functions for querying MySQL database."""
class DBFunc:

    #######################
    ### User management ###
    #######################

    # Check if user exists in ADMIN table
    def _user_exists(self, userid):
        r = self._query("SELECT userid FROM user WHERE userid=%s",(userid,))
        return len(r) is not 0

    # Add new userid entry to database
    def add_new_user(self, userid, name, email):
        return self._query("INSERT INTO user (`userid`,`name`,`email`) VALUES (%s,%s,%s)",(userid,name,email));

    # Get user type (0 = user, 1 = supervisor, 2 = administrator)
    # Return -1 if userid does not exist
    def get_user_type(self, userid):
        if self._user_exists(userid):
            return self.get_user_info("type",userid)
        else:
            return -1

    # # Check if user exists, and if so, compare the md5 hash
    # # of the given password with given userid. Additionally, the
    # # type in the user entry must be greater than or equal to the type
    # # that is passed to the function. Types are as follows:
    # # 0 = user, 1 = moderator, 2 = administrator
    # def authenticate_user(self, userid, password, req_type=0):
    #     if self._user_exists(userid):
    #         pwd_hash = self.get_user_info("password",userid)
    #         return self.check_permissions(userid,req_type) and \
    #                pwd_hash == Encoding.md5(password)
    #     return False

    def check_permissions(self, userid, req_type=0):
        if self._user_exists(userid):
            user_type = self.get_user_type(userid)
            return user_type >= req_type
        return False

    # Retrieve user specific data from ADMIN table
    def get_user_info(self, field, userid):
        return self._query("SELECT `{}` FROM {} WHERE userid=%s".format(field,Database.USERS_TABLE),(userid,))

    ############################
    ### Drone API management ###
    ############################

    # Verify that given UID exists in TABLE
    # Example usage: DBFunc.exists("D2Da037d","drones")
    def uid_exists(self, uid, table):
        r = self._query("SELECT uid FROM {} WHERE uid=%s".format(table),(uid,))
        return len(r) is not 0

    # Check that the provided AUTH hash code matches that which 
    # we have in our database for the given UID
    # Example usage: DBFunc.authorized("D2Da037d","fe3d1760dfad167b51b4ffc60f8bbefe")
    def authorized(self, uid, auth, table="drones"):
        r = self._query("SELECT auth FROM {} WHERE uid=%s".format(table),(uid,))
        return r == auth

    # Return a list of all values within a given field of a given table
    def get_values(self, field, table):
        tmp = []
        for t in self.get_all(field,table):
            tmp.append(t[0])
        return tmp

    # Return a list of all fields within a given table
    def get_fields(self, table):
        tmp = []
        q = self._query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='{}' AND TABLE_NAME='{}';".format(Database.DATABASE_NAME,table), return_all=True)
        for t in q:
            tmp.append(t[0])
        return tmp

    # Get value contained in FIELD from TABLE in row matching UID
    # Example usage: DBFunc.get("name","drones","D2Da037d")
    def get(self, field, table, uid):
        return self._query("SELECT {} FROM {} WHERE uid=%s".format(field,table),(uid,))

    # Set value of FIELD within TABLE in row matching UID
    # Example usage: DBFunc.set("name","Gregg","drones","D2Da037d")
    def set(self, field, value, table, uid):
        return self._query("UPDATE {} SET {}=%s WHERE uid=%s".format(table,field),(value,uid),return_data=False)

    # Get all values from all FIELDS in TABLE
    # Example usage: DBFunc.get_all("uid","drones")
    def get_all(self, field, table):
        return self._query("SELECT {} FROM {}".format(field,table), return_all=True)

    # Get all values from all FIELDS in TABLE where QFIELD == QVAL
    # If qfield2 and qval2 are supplied, AND is assumed.
    # Example usage: DBFunc.get_all("uid","drones","userid",USERID)
    def get_all_where(self, field, table, qfield, qval, qfield2=None, qval2=None):
        if qfield2 is not None and qval2 is not None:
            return self._query("SELECT {} FROM {} WHERE {}=%s AND {}=%s".format(field,table,qfield,qfield2),(qval,qval2),return_all=True)
        else:
            return self._query("SELECT {} FROM {} WHERE {}=%s".format(field,table,qfield),(qval,),return_all=True)

    ####################
    ### Job queueing ###
    ####################

    # Check if userid is present in the orders table. Only one delivery request
    # per user can be queued at a time. Function returns true if there is 
    # no order present in the orders queue belonging to a user with a matching userid
    def user_can_queue(self, userid):
        r1 = self._query("SELECT userid FROM orders WHERE userid=%s",(userid,))
        in_order_queue = len(r1) is not 0
        n_orders = self._query("SELECT ordercount FROM user WHERE userid=%s",(userid,))
        return not in_order_queue and n_orders == 0

    # Queue a new drone delivery order. Inputted parameter order must be a dict containing
    # all required values for the drone delivery (into MySQL table QUEUE).
    def add_order(self, order):
        self.increment_ordercount(order["userid"])  # increment user's ordercount by 1
        keys = ",".join(order.keys())
        vals = "','".join(order.values())  # joins values with quotes (start & end don't have quotes)
        sql = "INSERT INTO orders ({}) VALUES ('{}')".format(keys,vals)
        return self._query(sql,return_data=False)

    # Increment ordercount field in user table
    def increment_ordercount(self, userid):
        return self._query("UPDATE user SET ordercount=ordercount+1 WHERE userid='{}'".format(userid))

    # Set order UID in field within user table entry corresponding to current userid
    # To remove orderid from userid entry, pass orderid as empty string
    def update_user_order(self, userid, orderid=""):
        return self._query("UPDATE `user` SET `order`=%s WHERE `userid`=%s",(orderid,userid))

    ###############################
    ### Database administration ###
    ###############################

    # Delete row matching UID in TABLE
    def delete(self, uid, table):
        self._query("DELETE FROM {} WHERE uid=%s".format(table),(uid,),return_data=False)

    ########################
    ### Helper functions ###
    ########################

    # Generic database query function
    def _query(self, query, values=None, return_data=True, return_idx=0, return_all=False):
        connection = cherrypy.thread_data.db  # get db connection
        connection.ping(True)  # this should refresh the connection to the database if it has timed out: http://www.neotitans.com/resources/python/mysql-python-connection-error-2006.html
        cursor = connection.cursor()  # get cursor to execute SQL queries
        if values is None:
            cursor.execute(query)
        else:
            cursor.execute(query, values)   # escape values to prevent SQL injection
        connection.commit()  # save inserted data into database
        if return_data:
            rows = cursor.fetchall()
            if not return_all and len(rows) > 0:  # only return from first row
                return rows[0][return_idx]
            else:  # return all data or if result is empty
                return rows
        cursor.close()


""" Prevent XSS or SQL injection attacks """
class Secure:

    # Regex for userid
    @classmethod
    def credentials(self,string):
        pattern = "^[a-zA-Z]\w{2,14}$"  # must start with letter, btwn 3-15 characters
        return (re.match(pattern, string) is not None)


""" Generate consistent UIDs """
class UID:

    # Generate UID
    # Example usage: UID.generate("drone") or UID.generate("zone")
    @classmethod
    def generate(self,uid_type):
        randStr = "".join(random.sample(string.hexdigits, int(UIDConst.LENGTH)))
        if uid_type == "drone":
            c = UIDConst.DRONE_ID
        elif uid_type == "task":
            c = UIDConst.TASK_ID
        elif uid_type == "type":
            c = UIDConst.TYPE_ID
        elif uid_type == "order":
            c = UIDConst.ORDER_ID
        # TODO: should check that the UID does not already exist in the database
        return c + randStr


""" Get current timestamp """
class Timestamp:

    # Get current timestamp (string)
    @classmethod
    def now(self, return_str=True):
        the_time = datetime.datetime.now()
        if return_str:
            return str(the_time)
        else:
            return the_time

    # Add time (hours, minutes, and/or seconds) to current datetime object
    @classmethod
    def add_time(self,datetime_object,hours=0,minutes=0,seconds=0,return_str=True):
        new_time = datetime_object + datetime.timedelta(hours=hours,minutes=minutes,seconds=seconds)
        if return_str:
            return str(new_time)
        else:
            return new_time

    # Display format time (HH:SS am/pm)
    @classmethod
    def format(self,datetime_object):
        # Refer to: http://strftime.org/
        # Formats time as: '4:27 pm'
        return datetime_object.strftime('%-I:%M %p')

    # Get datetime object from timestamp string
    @classmethod
    def str2datetime(self,timestamp):
        return parser.parse(timestamp)


""" Generate various encodings of string """
class Encoding:

    @classmethod
    def md5(self, msg):
        m = hashlib.md5()
        m.update(msg)
        return m.hexdigest()


""" General web commands """
class Web:

    @classmethod
    def redirect(self, page):
        raise cherrypy.HTTPRedirect(page)