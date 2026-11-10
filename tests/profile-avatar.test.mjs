import {test} from 'node:test';
import assert from 'node:assert/strict';
import {avatarChoices,validAvatar} from '../lib/profile-avatar.ts';
test('avatars accept only presets, removal and bounded JPEG data',()=>{for(const value of avatarChoices)assert.equal(validAvatar(value),true);assert.equal(validAvatar(''),true);for(const value of [null,{},'https://example.com/photo.jpg','data:image/svg+xml;base64,PHN2Zz4=', 'data:image/jpeg;base64,'+'a'.repeat(40001)])assert.equal(validAvatar(value),false)});
