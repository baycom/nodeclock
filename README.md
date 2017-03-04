nodeclock is a node.js based distributed sports timer.

Installation procedure (Debian/Ubuntu/Raspbian) 

Login in to a console:

sudo apt-get update

sudo apt-get install nodejs nodejs-legacy npm ntp git

sudo npm install --global git://github.com/baycom/nodeclock.git

sudo cp /usr/local/lib/node_modules/nodeclock/dist/nodeclock.service /etc/systemd/system/

sudo systemctl daemon-reload

sudo systemctl enable nodeclock

sudo systemctl start nodeclock

Now you have installed the nodeclock service and you can point your local browser to http://localhost/manage
If you know the ip address or the network name of the nodeclock system you should be able to access the Manage page from everywhere you like. 

To update nodeclock simply call the install command again:

sudo npm install --global git://github.com/baycom/nodeclock.git

On a Raspbian system you might want to start Chromium in fullscreen mode on startup:

sudo cp /usr/local/lib/node_modules/nodeclock/dist/chromium-browser.desktop ~/.config/autostart/
