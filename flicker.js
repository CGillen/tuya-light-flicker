require('dotenv').config();
const TuyAPI = require('tuyapi');

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

(async () => {
	for (let i=0; i<num_devices; ++i) {
		await devices[i].find();
		await devices[i].connect();

		states[i] = await devices[i].get({ schema: true });

		await devices[i].set( { dps: 1, set: true });

		dev_intervals[i] = setInterval(() => { flicker(devices[i], states[i]) }, 150);
		setTimeout(() => { reset(devices[i], states[i], dev_intervals[i]); }, 10000);

		async function flicker(device, state) {
			vars = state.dps['5'].match(/.{1,2}/g).map(x => '0x'+x).map(x => parseInt(x));
			to_set = Math.floor(Math.random() * 255).toString(16)+'0000'+getUIState(vars); 
			await device.set({ dps: 5, set: to_set });
		}
		async function reset(device, state, dev_interval) {
			clearInterval(dev_interval);
			await devices[i].set({ multiple: true, data: state.dps });
			await devices[i].set({ dps: 1, set: state.dps['1'] });
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

