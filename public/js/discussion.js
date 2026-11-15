// Context-aware German Political Debate / Discussion Engine (Browser + Node compatible)

const STOP_WORDS = new Set([
  'aber', 'alle', 'allem', 'allen', 'aller', 'alles', 'also', 'andere', 'anderen', 'anderer',
  'auch', 'auf', 'aus', 'bei', 'beim', 'bin', 'bis', 'bist', 'dabei', 'dadurch', 'dafür',
  'dagegen', 'daher', 'damit', 'danach', 'dann', 'darum', 'dass', 'dazu', 'dein', 'deine',
  'dem', 'den', 'denen', 'denn', 'der', 'deren', 'des', 'deshalb', 'dessen', 'dich', 'die',
  'dies', 'diese', 'diesem', 'diesen', 'dieser', 'dieses', 'dir', 'doch', 'dort', 'durch',
  'eben', 'eigentlich', 'ein', 'eine', 'einem', 'einen', 'einer', 'eines', 'einfach', 'einmal',
  'erst', 'etwa', 'etwas', 'euch', 'euer', 'eure', 'für', 'ganz', 'gar', 'geben', 'gegen',
  'gehen', 'geht', 'genau', 'gerade', 'gibt', 'glaube', 'große', 'großen', 'gute', 'guten',
  'habe', 'haben', 'habt', 'halt', 'hat', 'hatte', 'hätte', 'hier', 'hinter', 'ich', 'ihm',
  'ihn', 'ihnen', 'ihr', 'ihre', 'ihrem', 'ihren', 'ihrer', 'immer', 'indem', 'irgendwie',
  'ist', 'jede', 'jedem', 'jeden', 'jeder', 'jedes', 'jetzt', 'kann', 'kannst', 'kein',
  'keine', 'keinem', 'keinen', 'keiner', 'klar', 'kommen', 'kommt', 'können', 'könnte',
  'lassen', 'lässt', 'leider', 'leute', 'machen', 'macht', 'man', 'mehr', 'mein', 'meine',
  'meinen', 'meiner', 'menschen', 'mich', 'mir', 'mit', 'muss', 'müssen', 'musst', 'nach',
  'nämlich', 'natürlich', 'neue', 'neuen', 'neuer', 'nicht', 'nichts', 'noch', 'nun', 'nur',
  'oder', 'ohne', 'punkt', 'quasi', 'sagen', 'sagt', 'sagte', 'schon', 'sehr', 'sein',
  'seine', 'seinem', 'seinen', 'seiner', 'seit', 'selbst', 'sich', 'sie', 'sind', 'so',
  'sogar', 'soll', 'sollen', 'sollte', 'sondern', 'sonst', 'sozusagen', 'statt', 'stehen',
  'steht', 'thema', 'trotzdem', 'über', 'überhaupt', 'ums', 'und', 'uns', 'unser', 'unsere',
  'unserem', 'unseren', 'unserer', 'unter', 'viel', 'viele', 'vielen', 'vielleicht', 'vom',
  'von', 'vor', 'wann', 'war', 'wäre', 'waren', 'warum', 'was', 'wegen', 'weil', 'weit',
  'weiter', 'welche', 'welcher', 'welches', 'wenn', 'wer', 'werden', 'werde', 'wird',
  'wie', 'wieder', 'will', 'wir', 'wirklich', 'wirst', 'wo', 'wohl', 'wollen', 'wollte',
  'wurde', 'würde', 'würden', 'zuerst', 'zum', 'zur', 'zusammen', 'zwischen',
]);

export const DISCUSSION_TOPICS = [
  {
    id: 'disc_wohnen',
    category: 'Kommunal & Soziales',
    title: 'Bezahlbares Wohnen vs. Investitionsstopp',
    openingPrompt:
      'Die Mieten steigen, gleichzeitig brechen die Baugenehmigungen ein. Was ist Ihr konkreter Weg aus der Wohnungskrise — mehr Regulierung oder schnelleres Bauen?',
    angles: {
      cost: 'Woher nehmen Kommunen oder Eigentümer das Geld für Neubau und Sanierung, wenn Baukosten und Zinsen heute so hoch sind?',
      fairness: 'Wie verhindern Sie, dass am Ende weder private Bauherren noch Genossenschaften überhaupt noch eine einzige neue Wohnung errichten?',
      concrete: 'Wenn morgen ein junges Paar oder eine Rentnerin vor Ihnen steht: Was genau ändert sich durch Ihren Vorschlag in den nächsten 12 Monaten?',
      tradeoff: 'Müssen wir für schnelleres Bauen Abstriche bei Umwelt- oder Bauvorschriften machen — ja oder nein?',
    },
  },
  {
    id: 'disc_klima_wirtschaft',
    category: 'Klima & Industrie',
    title: 'Klimaschutz und sichere Industriearbeitsplätze',
    openingPrompt:
      'Viele Beschäftigte in energieintensiven Betrieben befürchten durch strenge Klimavorgaben den Verlust ihrer Arbeit. Wie lösen Sie diesen Konflikt glaubwürdig auf?',
    angles: {
      cost: 'Wer bezahlt den Umbau der Netze und Anlagen, wenn Strompreise schon heute Betriebe zur Abwanderung bewegen?',
      fairness: 'Was sagen Sie einem Schichtarbeiter auf dem Land, der keine Alternative zum Diesel-Auto und kaum Rücklagen für eine neue Heizung hat?',
      concrete: 'Welches konkrete Instrument wirkt schneller und verlässlicher: strengere Verbote oder gezielte Investitionsanreize?',
      tradeoff: 'Was hat im Zweifel Vorrang, wenn ein Werk vor Ort wegen hoher Umweltauflagen vor der Schließung steht?',
    },
  },
  {
    id: 'disc_rente',
    category: 'Generationen & Sozialstaat',
    title: 'Rente, Fachkräftemangel und Generationengerechtigkeit',
    openingPrompt:
      'Immer weniger Beitragszahler finanzieren immer mehr Rentenjahre. Wie sichern Sie auskömmliche Renten, ohne junge Arbeitnehmer zu überfordern?',
    angles: {
      cost: 'Steigende Beiträge belasten Löhne, höheres Renteneintrittsalter trifft körperlich Arbeitende — welche unbequeme Wahrheit muten Sie den Wählern zu?',
      fairness: 'Warum sollte die junge Generation heute noch mehr einzahlen, wenn sie selbst weniger Sicherheit erwarten kann?',
      concrete: 'Reicht mehr Zuwanderung und längeres Arbeiten wirklich aus — oder wo genau setzen Sie den Rotstift an?',
      tradeoff: 'Sollten künftige Rentenerhöhungen stärker gedämpft werden oder die Beiträge für Beschäftigte steigen?',
    },
  },
  {
    id: 'disc_ki_arbeit',
    category: 'Wirtschaft & Zukunft',
    title: 'Künstliche Intelligenz in Betrieb, Verwaltung und Schule',
    openingPrompt:
      'Künstliche Intelligenz verändert ganze Berufsfelder rasant. Sollen wir KI in Deutschland stärker regulieren oder radikal entfesseln?',
    angles: {
      cost: 'Wie verhindern wir, dass der Mittelstand von Dokumentationspflichten erdrückt wird, während US- und China-Konzerne davonziehen?',
      fairness: 'Was passiert mit Menschen in Sachbearbeitung und Dienstleistung, deren Aufgaben plötzlich automatisiert werden?',
      concrete: 'Wie genau machen Sie Schulen und Weiterbildung fit, wenn selbst Behörden noch Formulare per Post verschicken?',
      tradeoff: 'Wo ziehen Sie die klare Grenze zwischen Schutz von Daten/Urheberrecht und technologischer Geschwindigkeit?',
    },
  },
  {
    id: 'disc_buerokratie',
    category: 'Staat & Handwerk',
    title: 'Schlanker Staat: Bürokratieabbau ohne Schutzverlust',
    openingPrompt:
      'Handwerk, Vereine und Kommunen ersticken in Genehmigungen und Nachweispflichten. Welche Regeln würden Sie konkret streichen?',
    angles: {
      cost: 'Jede Streichung einer Kontrolle birgt das Risiko eines Skandals — sind Sie bereit, dafür die politische Verantwortung zu übernehmen?',
      fairness: 'Warum schaffen alle Parteien im Wahlkampf Bürokratie ab, und nach der Wahl wächst der Aktenberg doch weiter?',
      concrete: 'Nennen Sie ein einziges Gesetz oder Verfahren, das Sie ab Montag abschaffen oder auf die Hälfte kürzen würden.',
      tradeoff: 'Wie viel Unsicherheit oder Ungleichheit zwischen Kommunen akzeptieren Sie für echte Schnelligkeit?',
    },
  },
  {
    id: 'disc_demokratie',
    category: 'Demokratie & Öffentlichkeit',
    title: 'Vertrauen zurückgewinnen in polarisierten Zeiten',
    openingPrompt:
      'Immer mehr Bürger sagen: „Die Politik lebt in ihrer eigenen Blase und hört nicht mehr zu.“ Wie brechen Sie diesen Zynismus?',
    angles: {
      cost: 'Reicht besseres Zuhören überhaupt noch, wenn den Menschen am Monatsende real Kaufkraft fehlt?',
      fairness: 'Wie reden Sie mit Menschen, die völlig gegensätzliche Positionen vertreten — wo endet Dialog und wo beginnt klare Kante?',
      concrete: 'Was tun Sie ganz konkret anders als die Politiker, über die sich die Bürger zu Recht ärgern?',
      tradeoff: 'Darf eine demokratische Führung manchmal bewusst unpopuläre Entscheidungen gegen die Mehrheitsstimmung durchsetzen?',
    },
  },
  {
    id: 'disc_verkehr',
    category: 'Stadt & Land',
    title: 'Mobilität der Zukunft für Großstadt und ländlichen Raum',
    openingPrompt:
      'In der Stadt wird über Tempo 30 und Parkplätze gestritten, auf dem Land fährt oft nur dreimal am Tag ein Bus. Wie sieht faire Verkehrspolitik aus?',
    angles: {
      cost: 'Woher kommen die Milliarden für marode Schienen und Brücken, ohne dass Pendler auf dem Land doppelt zahlen?',
      fairness: 'Fühlen sich Menschen außerhalb der Metropolen nicht zu Recht belehrt, wenn man ihnen das Auto verteuert ohne echte Alternative?',
      concrete: 'Wie organisieren Sie bezahlbaren Nahverkehr in einem 2.000-Seelen-Ort, ohne leere Busse durch die Gegend fahren zu lassen?',
      tradeoff: 'Schiene vor Straße – auch wenn dadurch der Ausbau überlasteter Bundesstraßen auf Eis liegt?',
    },
  },
  {
    id: 'disc_pflege',
    category: 'Gesundheit & Gesellschaft',
    title: 'Pflegenotstand und Belastungsgrenze im Gesundheitswesen',
    openingPrompt:
      'Stationen schließen Betten, Angehörige sind am Limit und Eigenanteile explodieren. Was ist Ihre ehrliche Antwort auf die Pflegekrise?',
    angles: {
      cost: 'Wer finanziert deutlich höhere Löhne und mehr Personal – steigende Kassenbeiträge, Steuern oder höhere Eigenanteile?',
      fairness: 'Warum gehen so viele gut ausgebildete Pflegekräfte nach wenigen Jahren aus dem Beruf, selbst wenn der Lohn leicht steigt?',
      concrete: 'Wie entlasten Sie eine Pflegekraft im Nachtdienst bereits in diesem Jahr spürbar von Dokumentationsarbeit?',
      tradeoff: 'Sollten wir kleinere Krankenhäuser zugunsten zentraler Fachkliniken schließen, auch wenn Wege weiter werden?',
    },
  },
  {
    id: 'disc_bildung',
    category: 'Bildung & Jugend',
    title: 'Chancengleichheit an Schulen und Wertschätzung für Ausbildung',
    openingPrompt:
      'Zu viele Jugendliche verlassen die Schule ohne sichere Perspektive, während Betriebe händeringend Azubis suchen. Was muss sich zuerst ändern?',
    angles: {
      cost: 'Schulgebäude sanieren, kleinere Klassen, Digitalisierung – wie überwinden Sie den Finanz- und Kompetenzstreit zwischen Bund, Ländern und Kommunen?',
      fairness: 'Warum hängt der Bildungserfolg bei uns immer noch so stark vom Elternhaus ab?',
      concrete: 'Welche einzige Reform im Schulalltag bringt Lehrkräften und Kindern den größten sofortigen Nutzen?',
      tradeoff: 'Mehr verbindliche Leistungsmessung und Sprachförderung von Anfang an – oder längeres gemeinsames Lernen ohne Druck?',
    },
  },
  {
    id: 'disc_europa',
    category: 'Europa & Sicherheit',
    title: 'Handlungsfähiges Europa und Sicherheit nach außen wie innen',
    openingPrompt:
      'Die Weltlage ist rauer geworden, gleichzeitig wächst bei vielen Skepsis gegenüber Brüssel. Warum brauchen wir gerade jetzt ein stärkeres Europa?',
    angles: {
      cost: 'Wie rechtfertigen Sie höhere gemeinsame Ausgaben für Sicherheit und Wettbewerbsfähigkeit vor Bürgern mit eigenen Alltagssorgen?',
      fairness: 'Wo mischt sich Brüssel tatsächlich zu tief in nationale oder kommunale Fragen ein?',
      concrete: 'Welchen konkreten Vorteil von Europa spürt ein normaler Handwerksbetrieb oder eine Familie hier vor Ort?',
      tradeoff: 'Sollten Mehrheitsentscheidungen in der EU das nationale Veto ablösen, auch wenn Deutschland dann überstimmt werden kann?',
    },
  },
];

export const DISCUSSION_PERSONAS = {
  moderator: {
    id: 'moderator',
    label: 'Kritischer Moderator',
    style: 'präzise, bohrt bei Finanzierung und Widersprüchen nach',
  },
  townhall: {
    id: 'townhall',
    label: 'Skeptischer Bürger (Townhall)',
    style: 'alltagsnah, misst alles an Miete, Lohn und Verlässlichkeit',
  },
  talkshow: {
    id: 'talkshow',
    label: 'Zuspitzender Debatten-Gegner',
    style: 'konfrontativ, zwingt zu klaren Prioritäten und Gegenpositionen',
  },
};

function cleanSentenceSnippet(text, maxLen = 78) {
  const cleaned = String(text || '').replace(/\s+/g, ' ').trim();
  if (!cleaned) return '';
  if (cleaned.length <= maxLen) return cleaned;
  const cut = cleaned.slice(0, maxLen).replace(/\s+\S*$/, '');
  return `${cut}…`;
}

export function extractDiscussionKeyTerms(text, usedTerms = []) {
  const usedSet = new Set(usedTerms.map((t) => t.toLowerCase()));
  const rawTokens = String(text || '').match(/[A-ZÄÖÜa-zäöüß-]{4,}/g) || [];
  const counts = new Map();

  for (const tok of rawTokens) {
    const clean = tok.replace(/^-+|-+$/g, '');
    const lower = clean.toLowerCase();
    if (clean.length < 4 || STOP_WORDS.has(lower)) continue;
    // Prefer capitalized German nouns + fresh unused words
    const isNoun = /^[A-ZÄÖÜ]/.test(clean);
    const weight = (isNoun ? 2.2 : 1) + (usedSet.has(lower) ? -1.5 : 0.6) + Math.min(1, clean.length / 12);
    const prev = counts.get(lower);
    counts.set(lower, { word: prev?.word || clean, score: (prev?.score || 0) + weight });
  }

  return [...counts.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((entry) => entry.word);
}

function pickBestQuoteClause(userText) {
  const clauses = String(userText || '')
    .split(/(?<=[.!?])\s+|[,;—]\s+|\n+/)
    .map((c) => c.trim())
    .filter((c) => c.split(/\s+/).length >= 4 && c.split(/\s+/).length <= 16);

  if (!clauses.length) {
    return cleanSentenceSnippet(userText, 64);
  }
  const scored = clauses.map((c) => {
    const hasAction = /(müssen|brauchen|wollen|können|sollen|geht|heißt|bedeutet|investieren|schaffen|ändern|sichern)/i.test(c);
    return { c, score: (hasAction ? 3 : 0) + Math.min(2, c.length / 35) };
  });
  scored.sort((a, b) => b.score - a.score);
  return cleanSentenceSnippet(scored[0].c, 74);
}

export function generateModeratorReply({
  topic,
  persona = 'moderator',
  history = [],
  userText = '',
  analysis = null,
  turnIndex = 1,
}) {
  const prevUsedAngles = history.filter((h) => h.role === 'moderator' && h.angle).map((h) => h.angle);
  const prevUsedTerms = history.filter((h) => h.role === 'moderator' && h.term).map((h) => h.term);

  const keyTerms = extractDiscussionKeyTerms(userText, prevUsedTerms);
  const primaryTerm = keyTerms[0] || '';
  const secondaryTerm = keyTerms[1] || '';
  const quote = pickBestQuoteClause(userText);

  const lower = String(userText || '').toLowerCase();
  const wordCount = analysis?.wordCount ?? (userText.trim() ? userText.trim().split(/\s+/).length : 0);
  const mentionsMoney = /(geld|kosten|finanz|steuer|milliarden|millionen|budget|haushalt|bezahlen|sparen|investier)/.test(lower);
  const mentionsExample = /(beispiel|alltag|familie|handwerker|schule|bus|pflege|nachbar|betrieb|stadt|dorf|kind|rentner|mieter)/.test(lower);
  const mentionsFutureOrCompromise = /(kompromiss|gegenseite|kritik|zusammen|gemeinsam|brücke|trotz|beide|einerseits|andererseits)/.test(lower);

  const candidateAngles = [];
  if (!mentionsMoney && !prevUsedAngles.includes('cost')) candidateAngles.push('cost');
  if (!mentionsExample && !prevUsedAngles.includes('concrete')) candidateAngles.push('concrete');
  if (!mentionsFutureOrCompromise && !prevUsedAngles.includes('fairness')) candidateAngles.push('fairness');
  if (!prevUsedAngles.includes('tradeoff')) candidateAngles.push('tradeoff');

  const allOrder = ['cost', 'fairness', 'concrete', 'tradeoff'];
  for (const a of allOrder) {
    if (!candidateAngles.includes(a)) candidateAngles.push(a);
  }
  // Pick first unused angle, or cycle cleanly after 4+ turns
  const chosenAngle =
    candidateAngles.find((a) => !prevUsedAngles.includes(a)) ||
    allOrder[(turnIndex - 1) % allOrder.length];

  const domainQuestion = topic?.angles?.[chosenAngle] || '';

  let opener = '';
  let followup = '';
  let tip = '';

  const refPhrase = primaryTerm
    ? `„${primaryTerm}“${secondaryTerm ? ` und „${secondaryTerm}“` : ''}`
    : quote
      ? `„${quote}“`
      : 'diesen Punkt';

  // Build personalized acknowledgment / challenge referencing the actual user answer
  if (wordCount > 0 && wordCount < 18) {
    opener =
      persona === 'townhall'
        ? `Das war jetzt extrem kurz – bei ${refPhrase} bleiben bei mir als Bürger noch alle praktischen Fragen offen.`
        : `Sie streifen ${refPhrase} nur ganz knapp.`;
  } else if (analysis && analysis.iCount > analysis.weCount + 1 && turnIndex >= 1) {
    opener =
      persona === 'talkshow'
        ? `Sie reden oft darüber, was Sie persönlich fordern – ${quote ? `etwa „${quote}“` : `bei ${refPhrase}`}. Aber Politik braucht Mehrheiten.`
        : `Sie setzen bei ${refPhrase} stark auf Ihre eigene Sicht.`;
  } else if (quote) {
    if (persona === 'townhall') {
      opener = `Ich hake genau bei Ihrem Satz ein: „${quote}“.`;
    } else if (persona === 'talkshow') {
      opener = `Sie sagen: „${quote}“ – genau das klingt für Kritiker nach einer Ausrede oder Wunschliste.`;
    } else {
      opener = `Sie haben eben betont: „${quote}“.`;
    }
  } else {
    opener = `Ich greife Ihren Gedanken zu ${refPhrase} auf.`;
  }

  // Deepen cross-turn recall on round 3+
  const earliestUserTurn = history.find((h) => h.role === 'user');
  const earlierTerm = earliestUserTurn
    ? extractDiscussionKeyTerms(earliestUserTurn.text, [primaryTerm])[0]
    : '';

  if (turnIndex >= 3 && earlierTerm && primaryTerm && earlierTerm.toLowerCase() !== primaryTerm.toLowerCase()) {
    followup =
      `Vorhin ging es Ihnen vor allem um „${earlierTerm}“, jetzt betonen Sie „${primaryTerm}“. ` +
      (domainQuestion || `Wie passt beides zusammen, wenn Ressourcen knapp sind und Sie sich entscheiden müssen?`);
    tip = 'Verbinde deinen früheren Punkt („Vorhin sagte ich…“) aktiv mit deiner neuen Antwort — das zeigt rote Linie und Souveränität.';
  } else if (chosenAngle === 'cost') {
    followup =
      (primaryTerm ? `Bei ${primaryTerm} stellt sich sofort die Finanzierungsfrage: ` : '') +
      (domainQuestion || 'Wer genau bezahlt das am Ende — und welches andere Vorhaben würden Sie dafür streichen?');
    tip = 'Weiche der Kostenfrage nicht aus: Nenne eine klare Priorität („Mir ist X wichtiger als Y, weil…“).';
  } else if (chosenAngle === 'fairness') {
    followup =
      (primaryTerm ? `Nehmen wir ${primaryTerm}: ` : '') +
      (domainQuestion || 'Was antworten Sie den Menschen, die das Gefühl haben, bei diesem Kurs genau die Verlierer zu sein?');
    tip = 'Anerkenne die Sorge der Gegenseite fair in einem Satz, bevor du deine Brücke baust („Ich verstehe diesen Einwand…“).';
  } else if (chosenAngle === 'concrete') {
    followup =
      domainQuestion ||
      `Machen Sie ${refPhrase} bitte greifbar: Welchen konkreten Unterschied spürt jemand im Alltag schon in sechs Monaten?`;
    tip = 'Gib ein einzelnes, konkretes Alltagsbild statt abstrakter Schlagworte („Denken Sie an eine Familie / einen Betrieb…“).';
  } else {
    followup =
      domainQuestion ||
      `Wo ziehen Sie bei ${refPhrase} eine klare rote Linie — was ist für Sie nicht verhandelbar und wo wären Sie zu einem Kompromiss bereit?`;
    tip = 'Nutze die Obama-Antithese: „Ich bin bereit für Kompromisse beim Weg – aber nicht beim Ziel.“';
  }

  // Add gentle rhetorical coaching note if pacing/pauses/fillers stood out
  let rhetoricHint = '';
  if (analysis) {
    if (analysis.fillers?.totalCount >= 2) {
      rhetoricHint = `Rhetorik-Tipp: ${analysis.fillers.totalCount} Füllwörter gehört — kurze Denkpause statt „ähm/halt“ wirkt stärker.`;
    } else if (analysis.wpm && analysis.wpm > 145) {
      rhetoricHint = `Rhetorik-Tipp: ${analysis.wpm} WPM war flott — im nächsten Konter ruhiger einsteigen (~125 WPM).`;
    } else if (analysis.devices?.totalDevices > 0) {
      rhetoricHint = 'Rhetorik-Plus: Gutes Stilmittel (Dreiklang/Kontrast) in deiner Erwiderung!';
    } else if (analysis.audio?.strategicPauses >= 2) {
      rhetoricHint = `Rhetorik-Plus: ${analysis.audio.strategicPauses} ruhige Wirkungspausen gehalten.`;
    }
  }

  return {
    text: `${opener} ${followup}`.replace(/\s+/g, ' ').trim(),
    angle: chosenAngle,
    term: primaryTerm,
    tip,
    rhetoricHint,
  };
}
