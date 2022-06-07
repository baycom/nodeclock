# nodeclock is a node.js based distributed sports timer 
### *originally designed for bouldering competitions*

## Installation procedure (Debian/Ubuntu/Raspbian) 

Login in to a console as user pi and then execute

```
sudo apt-get update
sudo apt-get install nodejs npm ntp git
sudo npm install --global https://github.com/baycom/nodeclock.git
sudo cp /usr/local/lib/node_modules/nodeclock/dist/nodeclock.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable nodeclock
sudo systemctl start nodeclock
```

Now you have installed the nodeclock service and you can point your local browser to http://localhost/manage
If you know the ip address or the network name of the nodeclock system you should be able to access the Manage page from everywhere you like. 

## To update nodeclock simply call the install command again:

```
sudo npm install --global https://github.com/baycom/nodeclock.git
```

## On a Raspbian system you might want to start Chromium in fullscreen mode on startup:

```
sudo apt-get install --no-install-recommends xserver-xorg xinit
sudo apt-get install realvnc-vnc-server raspberrypi-ui-mods chromium-browser
mkdir -p ~/.config/autostart/
cp /usr/local/lib/node_modules/nodeclock/dist/chromium-browser.desktop ~/.config/autostart/
```

## It also makes sense switching off screen blanking:

update the /etc/lightdm/lightdm.conf file and add in the [SeatDefaults] section the following command:
```
[SeatDefaults]
xserver-command=X -s 0 -dpms
```
You can use the nano editor:
```
sudo nano /etc/lightdm/lightdm.conf
```

## After all you may want to disable the syslog daemon to prevent your SD card from being worn out:
```
sudo systemctl stop rsyslog
sudo systemctl disable rsyslog

```

### If you need the audio to be sent to the 3,5mm headphone jack follow [these instructions] (https://www.raspberrypi.org/documentation/configuration/audio-config.md)
