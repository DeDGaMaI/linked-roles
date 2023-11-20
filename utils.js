const sequelize = require("./sequelize");
const SteamIDConverter = require("steamidconverter");
const logger = require("./logger");

const currentTimeMillis = Date.now();

const currentTime = new Date(currentTimeMillis);
const minutesToNextX0 = 10 - (currentTime.getMinutes() % 10);
const nextTimeMillis = currentTimeMillis + minutesToNextX0 * 60 * 1000;
let lastSended = nextTimeMillis - (1000 * 60 * 10); // хотел использовать, чтобы показывало, через сколько будут получены данные

function toSteamID3(steamid)
{
	let steamid3 = SteamIDConverter.toSteamID3(steamid);

	let regular = /(\[U:\d:(?<id>\d+)\])/gm;
	let res = regular.exec(steamid3);
	return res.groups.id;
}

function model(model) {
	switch (model) {
		case "tokens": return sequelize.models.users_tokens; break;
		case "data": return sequelize.models.users_data; break;
		case "waitlist": return sequelize.models.requests; break;
		default: return null; break;
	}
}

function ids64ToIds3(ids) {
	let arr = [];
	ids.forEach(id => {
		arr.push(toSteamID3(id));
	})
	return arr;
}

function removeItemAll(arr, value) {
	var i = 0;
	while (i < arr.length) {
		if (arr[i].steam_user_id === value) {
			arr.splice(i, 1);
		} else {
			++i;
		}
	}
	return arr;
}

function getLastSended() {
	return lastSended;
}

function setLastSended(timestamp) {
	logger.info("updated timestamp");
	lastSended = timestamp;
}

module.exports = {
	toSteamID3,
	model,
	ids64ToIds3,
	removeItemAll,
	getLastSended,
	setLastSended,
}