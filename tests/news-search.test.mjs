import test from 'node:test';import assert from 'node:assert/strict';
import {newsTopicMatches} from '../lib/news-search.ts';
test('zero relevance never qualifies and all meaningful search words must match',()=>{assert.equal(newsTopicMatches('Kabinet bespreekt begroting','voetbal'),false);assert.equal(newsTopicMatches('Voetbalclub wint finale','voetbal'),true);assert.equal(newsTopicMatches('Voetbalclub wint finale','voetbal Amsterdam'),false)});
test('short terms use word boundaries and multilingual aliases are explicit',()=>{assert.equal(newsTopicMatches('Fraai doelpunt','AI'),false);assert.equal(newsTopicMatches('Nieuwe kunstmatige intelligentie op school','AI'),true);assert.equal(newsTopicMatches('Voetbalteam wint','football'),true);assert.equal(newsTopicMatches('Ziekenhuis zoekt personeel','zorg'),true)});
test('empty and stopword-only queries do not match everything',()=>{assert.equal(newsTopicMatches('Nieuws van vandaag',''),false);assert.equal(newsTopicMatches('Nieuws van vandaag','nieuws over de'),false)});

test('zorg does not accidentally match zorgwekkend',()=>assert.equal(newsTopicMatches('Zorgwekkend verlies voor voetbalclub','zorg'),false));
