import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DISCUSSION_PERSONAS,
  DISCUSSION_TOPICS,
  extractDiscussionKeyTerms,
  generateModeratorReply,
} from '../public/js/discussion.js';

test('DISCUSSION_TOPICS provide complete angles and personas', () => {
  assert.ok(DISCUSSION_TOPICS.length >= 10);
  for (const topic of DISCUSSION_TOPICS) {
    assert.ok(topic.id && topic.title && topic.openingPrompt);
    assert.ok(topic.angles?.cost);
    assert.ok(topic.angles?.fairness);
    assert.ok(topic.angles?.concrete);
    assert.ok(topic.angles?.tradeoff);
  }
  assert.ok(DISCUSSION_PERSONAS.moderator);
  assert.ok(DISCUSSION_PERSONAS.townhall);
  assert.ok(DISCUSSION_PERSONAS.talkshow);
});

test('extractDiscussionKeyTerms prioritizes German nouns and deprioritizes used terms', () => {
  const text = 'Wir müssen den Wohnungsbau beschleunigen und Genehmigungen für Genossenschaften vereinfachen.';
  const fresh = extractDiscussionKeyTerms(text, []);
  assert.ok(fresh.includes('Wohnungsbau'));
  assert.ok(fresh.includes('Genehmigungen'));

  const secondPass = extractDiscussionKeyTerms(text, ['Wohnungsbau']);
  assert.notEqual(secondPass[0], 'Wohnungsbau');
});

test('generateModeratorReply engages directly, varies angles across turns, and recalls turn 1 in turn 3+', () => {
  const topic = DISCUSSION_TOPICS[0];
  const history = [
    { role: 'moderator', text: topic.openingPrompt },
  ];

  const turn1User =
    'Wir müssen vor allem beim Wohnungsbau schneller werden und Bauanträge digital in vier Wochen genehmigen.';
  history.push({ role: 'user', text: turn1User });
  const reply1 = generateModeratorReply({
    topic,
    persona: 'moderator',
    history,
    userText: turn1User,
    analysis: { wordCount: 14, iCount: 0, weCount: 1 },
    turnIndex: 1,
  });
  assert.ok(reply1.text.length > 30);
  assert.ok(/Wohnungsbau|Bauanträge|Genehmigen|schneller/i.test(reply1.text));
  assert.ok(reply1.angle);
  history.push({ role: 'moderator', ...reply1 });

  const turn2User =
    'Dafür setzen wir auf serielle Holzbauweise und gebündelte Fördermittel aus dem Landeshaushalt, sodass Kommunen sofort planen können.';
  history.push({ role: 'user', text: turn2User });
  const reply2 = generateModeratorReply({
    topic,
    persona: 'talkshow',
    history,
    userText: turn2User,
    analysis: { wordCount: 18, iCount: 0, weCount: 1 },
    turnIndex: 2,
  });
  assert.notEqual(reply2.angle, reply1.angle, 'turn 2 should pick a different follow-up angle');
  assert.ok(/Holzbauweise|Fördermittel|Landeshaushalt|Kommunen/i.test(reply2.text));
  history.push({ role: 'moderator', ...reply2 });

  const turn3User =
    'Für Mieter schaffen wir gleichzeitig klare Klimaschutz-Standards und bezahlbare Fernwärme in jedem Stadtteil.';
  history.push({ role: 'user', text: turn3User });
  const reply3 = generateModeratorReply({
    topic,
    persona: 'townhall',
    history,
    userText: turn3User,
    analysis: {
      wordCount: 14,
      iCount: 0,
      weCount: 1,
      fillers: { totalCount: 3 },
    },
    turnIndex: 3,
  });
  assert.ok(reply3.text.includes('Vorhin'), 'turn 3 should connect back to turn 1');
  assert.ok(reply3.rhetoricHint.includes('Füllwörter'));
});
