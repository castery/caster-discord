<p align="center">
<a href="https://travis-ci.org/castery/caster-discord"><img src="https://img.shields.io/travis/castery/caster-discord.svg?style=flat-square" alt="Build Status"></a>
<a href="https://www.npmjs.com/@castery/caster-discord"><img src="https://img.shields.io/npm/v/@castery/caster-discord.svg?style=flat-square" alt="NPM version"></a>
<a href="https://www.npmjs.com/package/@castery/caster-discord"><img src="https://img.shields.io/npm/dt/@castery/caster-discord.svg?style=flat-square" alt="NPM downloads"></a>
</p>

🤖 This is the official platform integration module for [caster](https://github.com/castery/caster). This platform was created for the social network [VK](https://vk.com)

| 🤖 [Caster](https://github.com/castery/caster) | 📖 [Documentation](docs/) |
|------------------------------------------------|----------------------------|

## Installation
**[Node.js](https://nodejs.org/) 8.0.0 or newer is required** 

### Yarn
Recommended, auto assembly
```shell
yarn add @castery/caster-discord
```

### NPM
```shell
npm install @castery/caster-discord --save
```

## Usage
```js
import { DiscordPlatform } from '@castery/caster-discord';

/* ... */

const discord = new DiscordPlatform({
	adapter: {
		token: '<token>'
	}
});

caster.use(discord);
```
