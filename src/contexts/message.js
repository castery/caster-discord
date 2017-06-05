'use strict';

import { PLATFORM_NAME } from '../util/constants';

/* TODO: Change from local package to npm */
import { MessageContext } from '../../../caster';

const enumTypesMessage = {
	text: 'channel'
};

/**
 * Incoming vk context
 *
 * @public
 */
export class DiscordMessageContext extends MessageContext {
	/**
	 * Constructor
	 *
	 * @param {Caster}  caster
	 * @param {Message} message
	 * @param {number}  id
	 */
	constructor (caster, message, id) {
		super(caster);

		this.platform = {
			id,
			name: PLATFORM_NAME
		};

		const { type } = message.channel;

		this.from = {
			id: message.channel.id,
			type: (type in enumTypesMessage)
				? enumTypesMessage[type]
				: type
		};

		this.sender = {
			id: message.author.id,
			type: 'user'
		};

		this.text = message.content;

		this.raw = message;
	}

	/**
	 * Sends a message to the current dialog
	 *
	 * @param {mixed}  text
	 * @param {Object} options
	 *
	 * @return {Promise<mixed>}
	 */
	send (text, options = {}) {
		if (typeof text === 'object') {
			options = text;
		} else {
			options.text = text;
		}

		this.to = this.from;
		this.text = options.text;

		const message = new DiscordMessageContext(this.caster, this.raw, this.platform.id);

		message.to = this.from;
		message.text = options.text;

		return this.caster.dispatchOutcoming(message);
	}

	/**
	 * Responds to a message with a mention
	 *
	 * @param {mixed}  text
	 * @param {Object} options
	 *
	 * @return {Promise<mixed>}
	 */
	reply (text, options = {}) {
		if (typeof text === 'object') {
			options = text;
		} else {
			options.text = text;
		}

		options.text = `<@${this.sender.id}>, ${options.text}`;

		return this.send(options);
	}
}
