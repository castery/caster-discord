'use strict';

import { Client as DiscordClient } from 'discord.js';

import { Platform } from '@castery/caster';

import createDebug from 'debug';

import { DiscordMessageContext } from './contexts/message';

import {
	PLATFORM_NAME,
	defaultOptions,
	supportAttachments,
	defaultOptionsSchema
} from './util/constants';

const debug = createDebug('caster:platform-discord');

/**
 * Platform for integration with social network VK
 *
 * @public
 */
export class DiscordPlatform extends Platform {
	/**
	 * Constructor
	 *
	 * @param {Object} options
	 */
	constructor (options = {}) {
		super();

		Object.assign(this.options, defaultOptions);

		this.discord = new DiscordClient;

		this._casters = new Set;

		if (Object.keys(options).length > 0) {
			this.setOptions(options);
		}

		this._addDefaultEvents();
	}

	/**
	 * @inheritdoc
	 */
	setOptions (options) {
		super.setOptions(options);

		if ('adapter' in options) {
			const { adapter } = this.options;

			if ('token' in options) {
				this.discord.login(adapter.token);
			}
		}

		return this;
	}

	/**
	 * @inheritdoc
	 */
	getOptionsSchema () {
		return defaultOptionsSchema;
	}

	/**
	 * @inheritdoc
	 */
	getAdapter () {
		return this.discord;
	}

	/**
	 * Returns the platform id
	 *
	 * @return {string}
	 */
	getId () {
		return this.options.id;
	}

	/**
	 * Returns the platform name
	 *
	 * @return {string}
	 */
	getPlatformName () {
		return PLATFORM_NAME;
	}

	/**
	 * @inheritdoc
	 */
	async start () {
		await this.discord.login(this.options.adapter.token);

		if (this.options.id === null) {
			this.setOptions({
				id: this.discord.user.id
			});
		}
	}

	/**
	 * @inheritdoc
	 */
	async stop () {
		await this.discord.destroy();
	}

	/**
	 * @inheritdoc
	 */
	async subscribe (caster) {
		this._casters.add(caster);

		if (!this.isStarted()) {
			await this.start();
		}

		caster.outcoming.addPlatform(this, async (context, next) => {
			if (context.getPlatformName() !== PLATFORM_NAME) {
				return await next();
			}

			if (context.getPlatformId() !== this.options.id) {
				return await next();
			}

			const options = {};

			if ('attachments' in context) {
				options.files = context.attachments.filter(({ type }) => (
					supportAttachments.includes(type)
				))
				.map(({ source }) => ({
					attachment: source
				}));
			}

			return await this.discord.channels.get(context.to.id).send(context.text, options);
		});
	}

	/**
	 * @inheritdoc
	 */
	async unsubscribe (caster) {
		this._casters.delete(caster);

		caster.outcoming.removePlatform(this);

		if (this._casters.size === 0 && this.isStarted()) {
			await this.stop();
		}
	}

	/**
	 * Add default events discord
	 */
	_addDefaultEvents () {
		this.discord.on('error', console.error);

		this.discord.on('message', (message) => {
			/* Ignore other bots and self */
			if (message.author.bot) {
				return;
			}

			for (const caster of this._casters) {
				caster.dispatchIncoming(
					new DiscordMessageContext(caster, message, this.options.id)
				);
			}
		});
	}
}
