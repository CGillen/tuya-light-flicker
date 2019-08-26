# Tuya Lights Flicker
A simple Node.js script to controll Tuya-compatible smart lights. Causes them to change to red and flicker randomly to spooky effect.

## Installation
1) install nodejs `sudo apt install -y nodejs npm`
1) Clone repo `git clone https://github.com/CGillen/tuya-lights-flicker.git`
1) Enter directory `cd tuya-lights-flicker`
1) Install dependencies `npm install`
1) Copy environment example file `cp .env.example .env`
1) Fill out `.env` file with number of devices and the correct device ID, key, and IP information. To find your ID and Key refer to these [setup instructions](https://github.com/codetheweb/tuyapi/blob/master/docs/SETUP.md)

## Basic Usage
1) Follow install instructions above
1) `node flicker.js`
