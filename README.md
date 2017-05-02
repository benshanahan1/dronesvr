# dronesvr

## To boot the server (requires root) in a daemon screen:
```
    $ ./boot
```

## To reattach to the lunadrop server screen (requires root):
```
    $ ./reattach
```

## Once attached to the lunadrop screen, you can do the following:
* To detach from the screen, press CTRL+A followed by D
* To shutdown the lunadrop server, press CTRL+C

# Summary
Back-end Web Server with Restful API for Autonomous Drone-based Delivery service.

# Getting Started
After cloning the repo, be sure to modify the files within `config/` to ensure that the server boots properly. To install dependencies:
```
    $ pip install -r requirements.txt
    $ sudo apt-get install screen
```
Additionally, be sure to rename `db.keys.generic` to `db.keys` and fill in information specific to your MySQL database.