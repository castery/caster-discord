import { MessageContext, CONTEXT_PROPS } from '@castery/caster';
import {
	PLATFORM_NAME,
	supportedContextTypes,
	supportedAttachmentTypes
} from '../util/constants';

const { SUPPORTED_CONTEXT_TYPES, SUPPORTED_ATTACHMENT_TYPES } = CONTEXT_PROPS;

const enumTypesMessage = {
	text: 'channel'
};

/**
 * Incoming vk context
 *
 * @public
 */
export default class DiscordMessageContext extends MessageContext {
	/**
	 * Constructor
	 *
	 * @param {Caster}  caster
	 * @param {Message} message
	 * @param {number}  id
	 */
	constructor(caster, { id, message, $text = null }) {
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
		this.$text = $text;

		this.raw = message;
	}

	/**
	 * Returns supported context types
	 *
	 * @return {Object}
	 */
	get [SUPPORTED_CONTEXT_TYPES]() {
		return supportedContextTypes;
	}

	/**
	 * Returns supported attachment types
	 *
	 * @return {Object}
	 */
	get [SUPPORTED_ATTACHMENT_TYPES]() {
		return supportedAttachmentTypes;
	}

	/**
	 * Sends a message to the current dialog
	 *
	 * @param {mixed}  text
	 * @param {Object} options
	 *
	 * @return {Promise<mixed>}
	 */
	send(text, options = {}) {
		if (typeof text === 'object') {
			options = text;
		} else {
			options.text = text;
		}

		this.to = this.from;
		this.text = options.text;

		const message = new DiscordMessageContext(this.caster, {
			id: this.platform.id,
			message: this.raw
		});

		message.to = this.from;
		message.text = options.text;

		if ('attachments' in options) {
			if (!Array.isArray(options.attachments)) {
				options.attachments = [options.attachments];
			} else {
				message.attachments = options.attachments;
			}
		}

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
	reply(text, options = {}) {
		if (typeof text === 'object') {
			options = text;
		} else {
			options.text = text;
		}

		options.text = `<@${this.sender.id}>, ${options.text}`;

		return this.send(options);
	}
}
