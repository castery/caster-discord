import createDebug from 'debug';
import { Client as DiscordClient } from 'discord.js';
import {
	Platform,
	UnsupportedContextTypeError,
	UnsupportedAttachmentTypeError
} from '@castery/caster';

import DiscordMessageContext from './contexts/message';
import {
	PLATFORM_NAME,
	defaultOptions,
	defaultOptionsSchema,
	supportedContextTypes,
	supportedAttachmentTypes
} from './util/constants';

const debug = createDebug('caster-discord');

/**
 * Platform for integration with social network VK
 *
 * @public
 */
export default class DiscordPlatform extends Platform {
	/**
	 * Constructor
	 *
	 * @param {Object} options
	 */
	constructor(options = {}) {
		super();

		Object.assign(this.options, defaultOptions);

		this.discord = new DiscordClient();

		this.casters = new Set();

		if (Object.keys(options).length > 0) {
			this.setOptions(options);
		}

		this.setReplacePrefix();
		this.addDefaultEvents();
	}

	/**
	 * @inheritdoc
	 */
	setOptions(options) {
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
	getOptionsSchema() {
		return defaultOptionsSchema;
	}

	/**
	 * @inheritdoc
	 */
	getAdapter() {
		return this.discord;
	}

	/**
	 * Returns the platform id
	 *
	 * @return {string}
	 */
	getId() {
		return this.options.id;
	}

	/**
	 * Returns the platform name
	 *
	 * @return {string}
	 */
	getPlatformName() {
		return PLATFORM_NAME;
	}

	/**
	 * @inheritdoc
	 */
	async start() {
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
	async stop() {
		await this.discord.destroy();
	}

	/**
	 * @inheritdoc
	 */
	async subscribe(caster) {
		this.casters.add(caster);

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

			if (supportedContextTypes[context.type] !== true) {
				throw new UnsupportedContextTypeError({
					type: context.type
				});
			}

			const channel = this.discord.channels.get(context.to.id);

			if ('attachments' in context) {
				for (const { type } of context.attachments) {
					if (supportedAttachmentTypes[type] !== true) {
						throw new UnsupportedAttachmentTypeError({ type });
					}
				}

				await Promise.all(context.attachments.map(({ source }) => (
					channel.send('', {
						file: source
					})
				)));
			}

			if (context.text) {
				await channel.send(context.text);
			}
		});
	}

	/**
	 * @inheritdoc
	 */
	async unsubscribe(caster) {
		this.casters.delete(caster);

		caster.outcoming.removePlatform(this);

		if (this.casters.size === 0 && this.isStarted()) {
			await this.stop();
		}
	}

	/**
	 * Add default events discord
	 */
	addDefaultEvents() {
		// eslint-disable-next-line no-console
		this.discord.on('error', console.error);

		this.discord.on('message', (message) => {
			/* Ignore other bots and self */
			if (message.author.bot) {
				return;
			}

			let $text = message.content;
			if ($text !== null) {
				if (!this.hasPrefix.test($text)) {
					return;
				}

				$text = $text.replace(this.replacePrefix, '');
			}

			for (const caster of this.casters) {
				caster.dispatchIncoming(new DiscordMessageContext(caster, {
					id: this.options.id,
					message,
					$text
				}));
			}
		});
	}

	/**
	 * Sets replace prefix
	 */
	setReplacePrefix() {
		let { prefix } = this.options;

		prefix = String.raw`^(?:${prefix.join('|')})`;

		this.hasPrefix = new RegExp(
			String.raw`${prefix}.+`,
			'i'
		);
		this.replacePrefix = new RegExp(
			String.raw`${prefix}?[, ]*`,
			'i'
		);
	}
}
