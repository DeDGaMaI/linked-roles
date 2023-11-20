const db = require("../db");
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const bot = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]});
const { getUsersStats } = require("./api.js");
const { removeItemAll, model } = require("../utils.js");
const { pushMetadata } = require("./discord_methods.js");
const logger = require("../logger");
const fs = require("fs");
const path = require("path");

function start(TOKEN) {
	const events = [];
	const eventFiles = fs.readdirSync(path.join(__dirname, 'events')).filter(file => file.endsWith('.js'));

	for (const file of eventFiles) {
		const event = require(`./events/${file}`);
		events.push(event);
	}
	events.forEach(event => {
		bot.on(event.name, (...args) => event.execute(bot, ...args));
	})
	logger.info("events deployed");
	bot.login(TOKEN);
}

function sendToUser(user_id, message) {
	bot.users.fetch(user_id, false).then(user => {
		logger.info(`msg ${user_id}: ${message}`);
		user.send(message);
	})
}

async function handleDbErrors() {
	try {
		let errors = await db.waitlist.get("error", 50);
		errors.forEach(async error => {
			let tokens = await db.users.tokens.get(error.discord_user_id);
			
			await db.waitlist.update(error.steam_user_id, "empty", "error");
			
			let metadata = {
				verified: false
			};
			await pushMetadata(error.discord_user_id, {
				access_token: tokens.access_token,
				refresh_token: tokens.refresh_token,
				expires_in: tokens.expires_in
			}, metadata);
		})
	}catch(e)
	{
		logger.info({err: e});
	}
}

async function updateStats() {
	let users = await db.users.data.getAll();
	let i = 0;
	users.forEach(async user => {
		await db.waitlist.insert(user.steam_user_id, user.discord_user_id);
		i++;
	})
}

async function pushUserMetadata(user_id)
{
	try {
		let tokens = await db.users.tokens.get(user_id);
		let user = await db.users.data.get(user_id);
		let metadata = {
			verified: true,
			rating: user.rating,
			match_count: user.match_count,
			avg_place: Number(user.avg_place).toFixed(1),
			first_places: user.first_places
		};
		await pushMetadata(user_id, {
			access_token: tokens.access_token,
			refresh_token: tokens.refresh_token,
			expires_in: tokens.expires_in
		}, metadata);
		logger.info(`pushing metadata of user ${user_id}`);
	}
	catch(e) {
		logger.info({err: e});
		console.error(e);
	}
}

async function requestUserStats(notifications = false) {
	try {
		let res = await db.waitlist.get("waiting", 10);
		logger.info(`reading waitlist`);
		if (res.length === 0) {
			logger.info(`no requests found, exiting`);
			return;
		}
		let steam_user_ids = [];
		res.forEach(user => {
			steam_user_ids.push(user.steam_user_id);
		})
		let users = await getUsersStats(steam_user_ids);
		
		users.data.forEach(async user => {
			metadata = {
				rating: user.rating,
				match_count: user.matchCount,
				avg_place: Number(user.avgPlace).toFixed(1),
				first_places: user.firstPlaces
			};
			let db_user = res.find(u => u.steam_user_id == user.playerId);
			await db.upsert(model("data"), {
				steam_user_id: user.playerId,
				discord_user_id: db_user.discord_user_id,
				rating: user.rating,
				avg_place: user.avgPlace,
				match_count: user.matchCount,
				first_places: user.firstPlaces
			}, {
				steam_user_id: db_user.steam_user_id
			});
			logger.info(`reading data of user ${user.playerId}|${db_user.discord_user_id}`);
			await pushUserMetadata(db_user.discord_user_id);
			await db.waitlist.update(user.playerId, "ok", "waiting");;
			//if (notifications) sendToUser(db_user.discord_user_id, "Ваши данные успешно обновлены, теперь все могут видеть вашу статистику. Здорово!")
			// некоторым из-за настроек приватности нельзя отправлять сообщения в лс, крашилось, но не выкидывало в catch
			removeItemAll(res, user.playerId)
		}); 
		// если есть записи из бд, на которых нет ответа(т.е. нету в бд 1х6)
		/*if (res.length !== 0) {
			logger.info(`final array not empty`)
			res.forEach(async user => {
				await db.waitlist.update(user.steam_user_id, "error")
				metadata = {
					verified: false,
				}
				let tokens = await db.users.tokens.get(user.discord_user_id)
				await pushMetadata(user.discord_user_id, {
					access_token: tokens.access_token,
					refresh_token: tokens.refresh_token,
					expires_in: tokens.expires_in
				}, metadata)
				if (notifications) sendToUser(user.discord_user_id, "Ошибка при получении данных. Не беспокойтесь, скоро с вами свяжется разработчик.")
				sendToUser("506449663042256899", "алоалаолаолао там чото поломалось иди чини лох АХХААхахах лооооох")
			})
		}*/
		// код на 130 либо не работает, либо в объекте ответа от бд есть ещё поля, кроме самих данных, иф триггерится даже когда все данные обработаны
	} catch(e)
	{
		logger.info({err: e})
		console.error(e);
	}
}

module.exports = {
	start,
	sendToUser,
	requestUserStats,
	pushUserMetadata,
	handleDbErrors,
	updateStats
};