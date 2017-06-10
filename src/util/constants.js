'use strict';

import Joi from 'joi';

/**
 * Platform context name
 *
 * @type {string}
 */
export const PLATFORM_NAME = 'discord';

/**
 * Supports attachments
 *
 * @type {Array}
 */
export const supportAttachments = ['image', 'video', 'document'];

/**
 * Default options platform
 *
 * @type {Object}
 */
export const defaultOptions = {
	id: null,

	adapter: {}
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

	adapter: Joi.object()
});
