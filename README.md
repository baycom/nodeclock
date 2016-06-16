nodeclock is a node.js based distributed sports timer.

Installation procedure (Debian/Ubuntu/Raspbian) 

Login in to a console:

sudo apt-get install nodejs nodejs-legacy npm ntp git

sudo npm install --global git://github.com/baycom/nodeclock.git

sudo cp /usr/local/lib/node_modules/nodeclock/dist/nodeclock.service /etc/systemd/system/

sudo systemctl daemon-reload

sudo systemctl start nodeclock

Now you have installed the nodeclock service and you can point you local browser to http://localhost/manage

On a Raspbian system you might want to install firefox:

sudo apt-get install iceweasel

To update nodeclock simply call the install command again:

sudo npm install --global git://github.com/baycom/nodeclock.git

