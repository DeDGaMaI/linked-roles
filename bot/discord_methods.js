const crypto = require('crypto');
const fetch = require('node-fetch');

const logger = require("../logger")
const db = require("../db")
const config = require('../config.js');
const {model} = require("../utils");

/**
 * Code specific to communicating with the Discord API.
 */

/**
 * The following methods all facilitate OAuth2 communication with Discord.
 * See https://discord.com/developers/docs/topics/oauth2 for more details.
 */

/**
 * Generate the url which the user will be directed to in order to approve the
 * bot, and see the list of requested scopes.
 */
module.exports.getOAuthUrl = function getOAuthUrl() {
	const state = crypto.randomUUID();

	const url = new URL('https://discord.com/api/oauth2/authorize');
	url.searchParams.set('client_id', config.DISCORD_CLIENT_ID);
	url.searchParams.set('redirect_uri', config.DISCORD_REDIRECT_URI);
	url.searchParams.set('response_type', 'code');
	url.searchParams.set('state', state);
	url.searchParams.set('scope', 'role_connections.write identify connections');
	url.searchParams.set('prompt', 'consent');
	return { state, url: url.toString() };
}

/**
 * Given an OAuth2 code from the scope approval page, make a request to Discord's
 * OAuth2 service to retrieve an access token, refresh token, and expiration.
 */
module.exports.getOAuthTokens = async function getOAuthTokens(code) {
	const url = 'https://discord.com/api/v10/oauth2/token';
	const body = new URLSearchParams({
		client_id: config.DISCORD_CLIENT_ID,
		client_secret: config.DISCORD_CLIENT_SECRET,
		grant_type: 'authorization_code',
		code,
		redirect_uri: config.DISCORD_REDIRECT_URI,
	});

	const response = await fetch(url, {
		body,
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
	});
	if (response.ok) {
		return await response.json();
	} else {
		logger.info({err: `Error fetching OAuth tokens: [${response.status}] ${response.statusText}`})
		throw new Error(`Error fetching OAuth tokens: [${response.status}] ${response.statusText}`);
	}
}

/**
 * The initial token request comes with both an access token and a refresh
 * token.  Check if the access token has expired, and if it has, use the
 * refresh token to acquire a new, fresh access token.
 */
async function getAccessToken(userId, tokens) {
	if (Date.now() > tokens.expires_in) {
		const url = 'https://discord.com/api/v10/oauth2/token';
		const body = new URLSearchParams({
			client_id: config.DISCORD_CLIENT_ID,
			client_secret: config.DISCORD_CLIENT_SECRET,
			grant_type: 'refresh_token',
			refresh_token: tokens.refresh_token,
		});
		const response = await fetch(url, {
			body,
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		});
		if (response.ok) {
			const tokens = await response.json();
			tokens.expires_at = Date.now() + tokens.expires_in * 1000;
			console.log("TOKENS ", tokens)

			await db.upsert(model("tokens"),{discord_user_id: userId, access_token: tokens.access_token, refresh_token: tokens.refresh_token, expires_in: tokens.expires_at}, {discord_user_id: Number(userId)});
			return tokens.access_token;
		} else {
			logger.info({err: `Error refreshing access token: [${response.status}] ${response.statusText}`})
			throw new Error(`Error refreshing access token: [${response.status}] ${response.statusText}`);
		}
	}
	return tokens.access_token;
}

/**
 * Given a user based access token, fetch profile information for the current user.
 */
module.exports.getUserData = async function getUserData(tokens) {
	const url = 'https://discord.com/api/v10/oauth2/@me';
	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${tokens.access_token}`,
		},
	});
	if (response.ok) {
		return await response.json();
	} else {
		logger.info({err: `Error refreshing access token: [${response.status}] ${response.statusText}`})
		throw new Error(`Error fetching user data: [${response.status}] ${response.statusText}`);
	}
}

module.exports.getUserConnections = async function getUserData(tokens) {
	const url = 'https://discord.com/api/v10/users/@me/connections';
	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${tokens.access_token}`,
		},
	});
	console.log(`Bearer ${tokens.access_token}`)
	if (response.ok) {
		return await response.json();
	} else {
		logger.info({err: `Error refreshing access token: [${response.status}] ${response.statusText}`})
		throw new Error(`Error fetching user data: [${response.status}] ${response.statusText}`);
	}
}

/**
 * Given metadata that matches the schema, push that data to Discord on behalf
 * of the current user.
 */
module.exports.pushMetadata = async function pushMetadata(userId, tokens, metadata) {
	// PUT /users/@me/applications/:id/role-connection
	const url = `https://discord.com/api/v10/users/@me/applications/${config.DISCORD_CLIENT_ID}/role-connection`;
	const accessToken = await getAccessToken(userId, tokens);
	const body = {
		platform_name: 'DOTA1x6 ммр',
		metadata,
	};
	const response = await fetch(url, {
		method: 'PUT',
		body: JSON.stringify(body),
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'Content-Type': 'application/json',
		},
	});
	if (!response.ok) {
		logger.info({err: `Error pushing discord metadata: [${response.status}] ${response.statusText}`})
		throw new Error(`Error pushing discord metadata: [${response.status}] ${response.statusText}`);
	}
}

/**
 * Fetch the metadata currently pushed to Discord for the currently logged
 * in user, for this specific bot.
 */
module.exports.getMetadata = async function getMetadata(userId, tokens) {
	// GET /users/@me/applications/:id/role-connection
	const url = `https://discord.com/api/v10/users/@me/applications/${config.DISCORD_CLIENT_ID}/role-connection`;
	const accessToken = await getAccessToken(userId, tokens);
	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});
	if (response.ok) {
		const data = await response.json();
		return data;
	} else {
		logger.info({err: `Error pushing discord metadata: [${response.status}] ${response.statusText}`})
		throw new Error(`Error getting discord metadata: [${response.status}] ${response.statusText}`);
	}
}

module.exports.getAccessToken = getAccessToken