const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const discord = require("../bot/discord_methods");
const db = require("../db");
const sequelize = require("../sequelize");
const { model, toSteamID3, getLastSended} = require("../utils");
const { sendToUser } = require("../bot");
const logger = require("../logger");

require("dotenv").config();

app.use(cookieParser(process.env.COOKIE_SECRET));

app.use("/dota1x6", (req, res, next) => {
	logger.info({req: req});
	next();
});

app.get('/dota1x6/linked-role', async (req, res) => {
	const { url, state } = discord.getOAuthUrl();

	// Store the signed state param in the user's cookies so we can verify
	// the value later. See:
	// https://discord.com/developers/docs/topics/oauth2#state-and-security
	res.cookie('clientState', state, { maxAge: 1000 * 60 * 5, signed: true });

	// Send the user to the Discord owned OAuth2 authorization endpoint
	res.redirect(url);
});

/**
 * Route configured in the Discord developer console, the redirect Url to which
 * the user is sent after approving the bot for their Discord account. This
 * completes a few steps:
 * 1. Uses the code to acquire Discord OAuth2 tokens
 * 2. Uses the Discord Access Token to fetch the user profile
 * 3. Stores the OAuth2 Discord Tokens in Redis / Firestore
 * 4. Lets the user know it's all good and to go back to Discord
 */
app.get('/dota1x6/discord-oauth-callback', async (req, res) => {
	try {
		// 1. Uses the code and state to acquire Discord OAuth2 tokens
		const code = req.query['code'];
		const discordState = req.query['state'];

		// make sure the state parameter exists
		const { clientState } = req.signedCookies;
		if (clientState !== discordState) {
			console.error('State verification failed.');
			return res.sendStatus(403);
		}

		const tokens = await discord.getOAuthTokens(code);

		console.log("TOKENS ", tokens);

		// 2. Uses the Discord Access Token to fetch the user profile
		const meData = await discord.getUserData(tokens);
		const userId = meData.user.id;
		await db.upsert(model("tokens"), {discord_user_id: userId, access_token: tokens.access_token, refresh_token: tokens.refresh_token, expires_in: Date.now() + tokens.expires_in * 1000}, {discord_user_id: userId});
		res.cookie('userId', userId, { maxAge: 1000*60*60*24*30, signed: true });
		let connections = await discord.getUserConnections(tokens);
		let steam = connections.find(({ type }) => type == "steam")
		if(!steam) {
			res.status(400);
			res.send("Пожалуйста, подключите ваш Steam-аккаунт к вашему Discord!");
		}
		else {
			let requests = await sequelize.models.requests.findOne({
				where: {
					discord_user_id: userId,
					status: "waiting"
				}
			});
			if (!requests) {
				await db.waitlist.insert(toSteamID3(steam.id), userId);


				await updateMetadata(userId);
				//let timestamp = getLastSended() + (1000 * 60 * 10 * Math.ceil(await db.waitlist.getDif(userId)/10));
				//console.log(timestamp, Math.ceil(await db.waitlist.getDif(userId)/10));
				//sendToUser(userId, `Отлично! Мы запросили ваши данные. `);//Примерное время ожидания: <t:${Math.ceil(timestamp/1000)}:R>`);
				// хотел использовать, чтобы показывало, через сколько будут получены данные
				res.send('Отлично! Ваша статистика будет готова через некоторое время, не беспокойтесь. Теперь можно вернуться обратно!');
			}
			else {
				res.send("У вас уже есть заявка в списке ожидания, наберитесь терпения!");
			}
		}
	} catch (e) {
		console.error(e);
		res.sendStatus(500);
	}
});

/**
 * Given a Discord UserId, push static make-believe data to the Discord
 * metadata endpoint.
 */
async function updateMetadata(userId) {
	// Fetch the Discord tokens from storage
	const tokens = await sequelize.models.users_tokens.findOne({
		where: {
			discord_user_id: userId
		}
	});

	let metadata = {};
	try {
		// Fetch the new metadata you want to use from an external source.
		// This data could be POST-ed to this endpoint, but every service
		// is going to be different.  To keep the example simple, we'll
		// just generate some random data.
		metadata = {
			verified: true,
		};
	} catch (e) {
		e.message = `Error fetching external data: ${e.message}`;
		console.error(e);
		// If fetching the profile data for the external service fails for any reason,
		// ensure metadata on the Discord side is nulled out. This prevents cases
		// where the user revokes an external app permissions, and is left with
		// stale linked role data.
	}

	// Push the data to Discord.
	await discord.pushMetadata(userId, tokens, metadata);
}

module.exports = app;
