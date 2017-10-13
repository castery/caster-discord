import Joi from 'joi';

import { MessageContext } from '@castery/caster';

/**
 * Platform context name
 *
 * @type {string}
 */
export const PLATFORM_NAME = 'discord';

/**
 * Supported platform types
 *
 * @type {Object}
 */
export const supportedContextTypes = MessageContext.defaultSupportedContextTypes({
	message: true
});

/**
 * Supported platform attachments
 *
 * @type {Object}
 */
export const supportedAttachmentTypes = MessageContext.defaultSupportedAttachmentTypes({
	image: true,
	video: true,
	document: true
});

/**
 * Default options platform
 *
 * @type {Object}
 */
export const defaultOptions = {
	id: null,

	adapter: {},

	prefix: ['!']
};

/**
 * Default options platform schema
 *
 * @type {Object}
 *
 * @extends {defaultOptions}
 */
export const defaultOptionsSchema = Joi.object().keys({
	id: Joi.string().allow(null),

	adapter: Joi.object(),

	prefix: Joi.array()
});
