require('dotenv').config();
const TuyAPI = require('tuyapi');

var flicker_length = 10000;
var flicker_speed = 150;

// Build device list from .env file
const num_devices = process.env.NUM_DEVICES;
var devices = [];
var states = [];
var dev_intervals = [];
for (i=0; i<num_devices; ++i) {
	devices[i] = new TuyAPI({
		id: process.env[`DEVICE_ID_${i}`],
		key: process.env[`DEVICE_KEY_${i}`],
		ip: process.env[`DEVICE_IP_${i}`]
	});
}

// Synchronously set devices to flicker
(async () => {
	for (let i=0; i<num_devices; ++i) {
		// Establish connection to device
		await devices[i].find();
		await devices[i].connect();

		// Store current state of device
		states[i] = await devices[i].get({ schema: true });

		// Make sure device is on
		await devices[i].set( { dps: 1, set: true });

		// Start flickering device. 150ms seems to be the fastest Tuya devices will respond safely
		dev_intervals[i] = setInterval(() => { flicker(devices[i], states[i]) }, Math.max(flicker_speed, 150));
		// Stop flickering and reset device
		setTimeout(() => { reset(devices[i], states[i], dev_intervals[i]); }, flicker_length);

		// Flicker by setting color to varying intensities of red.
		async function flicker(device, state) {
			// Originally, I planned to parse the current state and vector scale the current color, but got lazy
			// Instead, we'll use them to keep other UIs consistent
			vars = state.dps['5'].match(/.{1,2}/g).map(x => '0x'+x).map(x => parseInt(x));
			
			// First 3 bytes or RGB values, last 4 bytes are UI hints as far as I can tell
			to_set = Math.floor(Math.random() * 255).toString(16)+'0000'+getUIState(vars); 
			await device.set({ dps: 5, set: to_set });
		}
		// Set the device to the original RGB and on/off state
		async function reset(device, state, dev_interval) {
			// Remove flicker interval
			clearInterval(dev_interval);
			// Set RGB values and on/off state. On/Off does not seem to set during multiple state set
			await devices[i].set({ multiple: true, data: state.dps });
			await devices[i].set({ dps: 1, set: state.dps['1'] });
			// Close device connection
			device.disconnect();
		}
	}
})();

function getUIState(vars) {
	return 	vars[3].toString(16).padStart(2, '0') + 
		vars[4].toString(16).padStart(2, '0') +
		vars[5].toString(16).padStart(2, '0') + 
		vars[6].toString(16).padStart(2, '0'); 
}

