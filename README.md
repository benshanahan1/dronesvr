# dronesvr

## To boot the server (root):
```
    $ sh boot
```

## To shut down the server (root):
```
    $ sh shutdown
```

# Summary
Back-end Web Server with Restful API for Autonomous Drone-based Delivery service.

# Getting Started
After cloning the repo, be sure to modify the files within `config/` to ensure that the server boots properly. To install python dependencies:
```
    $ pip install -r requirements.txt
```
Additionally, be sure to rename `db.keys.generic` to `db.keys` and fill in information specific to your MySQL database.