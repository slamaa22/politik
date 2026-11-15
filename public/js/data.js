// Curated German Political Speech & Obama-Rhetoric Training Content

export const DIMENSION_META = {
  tempo: { label: 'Tempo & Gelassenheit', short: 'Tempo', target: '115–135 WPM' },
  pausen: { label: 'Strategische Pausen', short: 'Pausen', target: '15–25 %' },
  dynamik: { label: 'Stimm-Dynamik', short: 'Dynamik', target: 'Ruhig → Crescendo' },
  stilmittel: { label: 'Obama-Stilmittel', short: 'Stilmittel', target: 'Dreiklang & Kontrast' },
  wirCharisma: { label: '„Wir“-Charisma', short: 'Wir-Charisma', target: '> 65 % Wir-Fokus' },
  klarheit: { label: 'Klarheit & Kadenz', short: 'Klarheit', target: '0 Füllwörter' },
};

export const BASELINE_PARTS = [
  {
    id: 'part1',
    step: 1,
    title: 'Teil 1: Deine spontane Haltung',
    durationSec: 60,
    type: 'spontan',
    prompt:
      'Warum willst du in die Politik gehen – und was ist die eine Sache in deinem Umfeld, die sich wirklich ändern muss?',
    hint: 'Sprich frei aus dem Bauch heraus, so wie du heute redest. Verstelle dich noch nicht — wir messen deinen echten Ausgangspunkt.',
    mandatoryWords: [],
  },
  {
    id: 'part2',
    step: 2,
    title: 'Teil 2: Kadenz- & Pausen-Check (Ablesen)',
    durationSec: 50,
    type: 'lesen',
    prompt: 'Lies diesen kurzen Text laut vor und achte auf die markierten Pausen und Betonungen:',
    readText: `[RUHIGER]
Es gibt Momente, in denen man spürt: So wie bisher geht es nicht weiter. [PAUSE 1.5s]
Nicht, weil wir zu wenig Probleme benannt hätten.
Sondern weil zu viele Menschen aufgehört haben, an [BETONUNG] Lösungen zu glauben. [PAUSE 1.2s]

[CRESCENDO] Aber genau hier beginnt unsere Aufgabe.
Nicht mit großen Versprechen. Nicht mit lauten Parolen. Sondern mit dem Mut, wieder zuzuhören, anzupacken und gemeinsam anzufangen. [PAUSE 1.5s]
Das ist der Unterschied. Und dafür stehen wir heute hier.`,
    hint: 'Nimm dir bei jedem [PAUSE] wirklich die volle Sekunde Stille. Starte ruhig und werde zum [CRESCENDO] leicht kraftvoller.',
    mandatoryWords: [],
  },
  {
    id: 'part3',
    step: 3,
    title: 'Teil 3: Brückenbau unter Druck',
    durationSec: 60,
    type: 'wort-challenge',
    prompt: 'Thema: „Wie gewinnen wir junge Menschen wieder für Demokratie und Engagement?“',
    hint: 'Baue alle 3 Pflichtwörter organisch in deine freie 60-Sekunden-Rede ein.',
    mandatoryWords: ['Brücke', 'Vertrauen', 'Morgen'],
  },
];

export const SPONTAN_TOPICS = [
  {
    category: 'Kommunalpolitik',
    topic: 'Wie machen wir unsere Innenstädte und Stadtteile wieder zu echten Treffpunkten für alle Generationen?',
    angle: 'Beginne mit einem konkreten Ort in deiner Stadt, den jeder kennt.',
  },
  {
    category: 'Kommunalpolitik',
    topic: 'Bezahlbares Wohnen: Warum darf das Zuhause nicht zum Luxusgut werden?',
    angle: 'Nutze einen Kontrast: „Es geht nicht um Beton – es geht um Familien, die hier verwurzelt sind.“',
  },
  {
    category: 'Bildung & Jugend',
    topic: 'Was muss sich an unseren Schulen ändern, damit Herkunft nicht mehr über Chancen entscheidet?',
    angle: 'Verbinde eine eigene Schulerfahrung mit einem klaren Dreiklang für die Zukunft.',
  },
  {
    category: 'Bildung & Jugend',
    topic: 'Ausbildung vs. Studium: Warum verdient das Handwerk denselben Respekt wie jeder Masterabschluss?',
    angle: 'Sprich Menschen im Handwerk direkt mit Wertschätzung an.',
  },
  {
    category: 'Wirtschaft & Arbeit',
    topic: 'Künstliche Intelligenz und Wandel der Arbeit: Wie nehmen wir Menschen die Angst vor morgen?',
    angle: 'Setze ruhige Zuversicht gegen Panikmache.',
  },
  {
    category: 'Wirtschaft & Arbeit',
    topic: 'Faire Löhne und starke Betriebe – warum gute Wirtschaft und soziale Sicherheit zusammengehören.',
    angle: 'Brich das falsche Entweder-Oder auf („Nicht Arbeit gegen Wirtschaft, sondern...“).',
  },
  {
    category: 'Klima & Transformation',
    topic: 'Klimaschutz ohne Spaltung: Wie gelingt die Energiewende so, dass die Mitte mitzieht?',
    angle: 'Vermeide Moralisieren; betone Chancen, Innovation und Verlässlichkeit.',
  },
  {
    category: 'Klima & Transformation',
    topic: 'Öffentlicher Nahverkehr auf dem Land und in der Stadt – Mobilität als Frage der Freiheit.',
    angle: 'Erzähle von jemandem, der morgens auf den Bus angewiesen ist.',
  },
  {
    category: 'Demokratie & Zusammenhalt',
    topic: 'Warum ist Kompromissbereitschaft in einer Demokratie keine Schwäche, sondern echte Stärke?',
    angle: 'Nutze Obamas Signature-Move: beide Seiten anerkennen, dann über das Gemeinsame verbinden.',
  },
  {
    category: 'Demokratie & Zusammenhalt',
    topic: 'Einsamkeit, Polarisierung und Social Media: Wie lernen wir wieder, miteinander statt übereinander zu reden?',
    angle: 'Arbeite mit einer 1,5-Sekunden-Pause vor deiner zentralen Frage.',
  },
  {
    category: 'Krisen & Haltung',
    topic: 'Wenn Bürger sagen „Die da oben machen doch eh, was sie wollen“ – was ist deine ehrliche Antwort?',
    angle: 'Erst Verständnis zeigen, dann Verantwortung übernehmen, dann zum Mitmachen einladen.',
  },
  {
    category: 'Krisen & Haltung',
    topic: 'Was bedeutet moderner Patriotismus und Heimatliebe für dich – ohne Ausgrenzung?',
    angle: 'Definiere Heimat über Verantwortung füreinander, nicht über Abgrenzung.',
  },
  {
    category: 'Gesundheit & Pflege',
    topic: 'Pflegenotstand und Respekt: Was schulden wir den Menschen, die unsere Gesellschaft zusammenhalten?',
    angle: 'Starker Kontrast zwischen Applaus in Krisen und konkreter Entlastung im Alltag.',
  },
  {
    category: 'Digitalisierung & Staat',
    topic: 'Warum ein moderner, schneller Staat die beste Werbung für unsere Demokratie ist.',
    angle: 'Konkretes Alltagsbeispiel (Bürgeramt/Formular) → großes Prinzip (Vertrauen).',
  },
  {
    category: 'Europa & Sicherheit',
    topic: 'Warum ein starkes, handlungsfähiges Europa keine abstrakte Idee, sondern unsere Lebensversicherung ist.',
    angle: 'Erkläre Europa nicht über Institutionen, sondern über Frieden, Reisefreiheit und gemeinsame Stärke.',
  },
  {
    category: 'Europa & Sicherheit',
    topic: 'Innere Sicherheit und Freiheit: Wie schützen wir unsere offene Gesellschaft ohne Aktionismus?',
    angle: 'Vermeide Härte-Posen; verbinde klaren Rechtsstaat mit Prävention und Respekt für Einsatzkräfte.',
  },
  {
    category: 'Medien & Öffentlichkeit',
    topic: 'Wut-Algorithmen vs. echte Debatte: Wie gewinnt man Aufmerksamkeit mit Vernunft statt Empörung?',
    angle: 'Nutze eine klare Antithese: „Lautstärke erzeugt Klicks – aber Haltung erzeugt Vertrauen.“',
  },
  {
    category: 'Bildung & Jugend',
    topic: 'Junge Menschen zwischen Zukunftsangst und Mitgestaltung: Warum gehört unsere Generation an den Verhandlungstisch?',
    angle: 'Verwandle ein persönliches Jugend-Erlebnis (Story of Self) in eine Einladung an alle Generationen.',
  },
  {
    category: 'Kommunalpolitik',
    topic: 'Vereinsleben, Ehrenamt und Feuerwehr: Was passiert mit einer Stadt, wenn niemand mehr mitmacht?',
    angle: 'Male zuerst das stille Szenario ohne Ehrenamt – und setze dann deinen Dank als Dreiklang.',
  },
  {
    category: 'Wirtschaft & Arbeit',
    topic: 'Bürokratieabbau für Handwerk und Mittelstand: Wie geben wir Menschen wieder Zeit für echte Arbeit?',
    angle: 'Nenne eine konkrete Alltagshürde beim Namen und führe in 3 Schritten zur Lösung.',
  },
  {
    category: 'Demokratie & Zusammenhalt',
    topic: 'Extremismus von rechts, links oder religiösem Fanatismus: Wie verteidigen wir die Mitte der Gesellschaft?',
    angle: 'Klare Kante gegen Spalter, gefolgt von einer konstruktiven Vision für Zusammenhalt.',
  },
  {
    category: 'Gesundheit & Pflege',
    topic: 'Einsamkeit im Alter und Druck auf Familien: Wie organisieren wir echte Nachbarschaftshilfe?',
    angle: 'Stelle eine persönliche Beobachtung an den Anfang und beende mit einem „Wir“-Appell.',
  },
  {
    category: 'Klima & Transformation',
    topic: 'Technologieoffenheit und Innovation statt Verbotsspirale: Wie begeistern wir für grünen Fortschritt?',
    angle: 'Sprich über Erfindergeist, neue Arbeitsplätze und Verlässlichkeit.',
  },
  {
    category: 'Krisen & Haltung',
    topic: 'Wenn eine eigene Entscheidung unpopulär ist: Wie erklärt man unangenehme Wahrheiten mit Respekt?',
    angle: 'Erst Verständnis zeigen, dann ehrlich erklären warum – kein Schönreden.',
  },
];

export const TELEPROMPTER_SPEECHES = [
  {
    id: 'speech_bruecken',
    title: 'Es gibt keine zwei Länder (DNC-2004-Kadenz)',
    category: 'Grundsatzrede',
    technique: 'Antithese & inklusives „Wir“-Crescendo',
    targetWpm: 124,
    text: `[RUHIGER]
Man sagt uns heute oft, unser Land sei tief gespalten. [PAUSE 1.5s]
Dass die einen auf dem Land leben und die anderen in der Großstadt. Dass die einen alt sind und die anderen jung. Dass wir uns längst nicht mehr verstehen. [PAUSE 1.2s]

Aber ich stehe heute vor Ihnen, um etwas anderes zu sagen: [PAUSE 1.0s]
Es gibt kein „wir hier“ gegen „die dort“.
Es gibt nicht nur die Menschen mit großem Vermögen und die Menschen, die jeden Cent zweimal umdrehen. [PAUSE 1.2s]

[CRESCENDO] Es gibt ein einziges Gemeinwesen.
Eine gemeinsame Verantwortung. Eine gemeinsame Zukunft. [PAUSE 1.5s]

Wir wollen keine Politik, die Angst verwaltet.
Wir wollen Politik, die [BETONUNG] Türen öffnet.
Wir wollen eine Wirtschaft, die Leistung belohnt, Schulen, die jedes Talent sehen, und Nachbarschaften, in denen man einander wieder grüßt. [PAUSE 1.5s]

Wenn wir den Mut haben, einander wieder zuzutrauen – [PAUSE 0.8s] dann fangen wir genau heute an.
Vielen Dank.`,
  },
  {
    id: 'speech_hoffnung_nicht_naiv',
    title: 'Hoffnung ist kein naives Wort',
    category: 'Wahlkampf-Finale',
    technique: 'Anapher & Definition durch Kontrast',
    targetWpm: 122,
    text: `[RUHIGER]
Kritiker sagen manchmal, wer von Hoffnung spricht, sei naiv. [PAUSE 1.5s]
Als hätten wir nicht erlebt, wie schwer Krisen wiegen. Als wüssten wir nicht, wie müde viele Menschen nach den letzten Jahren sind. [PAUSE 1.2s]

Aber verstehen Sie mich nicht falsch: [PAUSE 1.0s]
Hoffnung ist keine blinde Verharmlosung.
Hoffnung ist keine Ausrede für Wegsehen.
Hoffnung ist die [BETONUNG] Entschlossenheit, angesichts schwieriger Zeiten nicht zu kapitulieren. [PAUSE 1.5s]

[CRESCENDO] Hoffnung ist der Handwerker, der morgens um sechs seinen Betrieb aufschließt.
Hoffnung ist die Lehrerin, die nach Feierabend noch für ein Kind Zeit findet.
Hoffnung ist jeder Mensch hier im Saal, der sagt: „Ich meckere nicht nur – ich übernehme Verantwortung.“ [PAUSE 1.5s]

Wenn Sie mir Ihr Vertrauen schenken, verspreche ich Ihnen keine Wunder über Nacht.
Aber ich verspreche Ihnen eines: [PAUSE 1.2s]
Ich werde Sie nie vergessen. Ich werde Ihnen immer reinen Wein einschenken. Und ich werde jeden Tag für unsere gemeinsame Chance kämpfen.`,
  },
  {
    id: 'speech_stadtteil',
    title: 'Auf Augenhöhe im Viertel',
    category: 'Kommunal & Bürgernähe',
    technique: 'Konkretes Storytelling & warme Präsenz',
    targetWpm: 128,
    text: `[RUHIGER]
Letzte Woche stand ich morgens um halb acht vor der Bäckerei an der Ecke. [PAUSE 1.2s]
Neben mir warteten eine Pflegekraft nach ihrer Nachtschicht, ein Schüler mit viel zu schwerem Rucksack und ein Rentner mit seiner Zeitung. [PAUSE 1.0s]
Keiner von ihnen hat nach großen Ideologien gefragt. [PAUSE 1.4s]

Sie haben drei einfache Fragen gestellt: [PAUSE 0.8s]
Fährt mein Bus pünktlich?
Bleibt meine Wohnung bezahlbar?
Und hört eigentlich noch jemand zu, wenn wir hier vor Ort ein Problem haben? [PAUSE 1.5s]

[CRESCENDO] Politik beginnt nicht in Konferenzräumen.
Politik beginnt genau dort – an der Straßenecke, am Küchentisch, auf dem Bolzplatz. [PAUSE 1.2s]

Deshalb geht es in dieser Wahl nicht um Parteietiketten.
Es geht um [BETONUNG] Respekt vor dem Alltag.
Es geht um verlässliche Schulen, sichere Wege und einen Staat, der wieder funktioniert. [PAUSE 1.5s]
Packen wir es an. Gemeinsam.`,
  },
  {
    id: 'speech_jugend',
    title: 'An die nächste Generation',
    category: 'Bildung & Jugend',
    technique: 'Kurze Pointen-Sätze & Aufbruch',
    targetWpm: 126,
    text: `[RUHIGER]
Oft hört man von Erwachsenen den Satz: „Die Jugend ist unsere Zukunft.“ [PAUSE 1.4s]
Das klingt freundlich. Aber es ist nur die halbe Wahrheit. [PAUSE 1.0s]
Ihr seid nicht erst irgendwann unsere Zukunft. Ihr seid [BETONUNG] heute schon unsere Gegenwart. [PAUSE 1.5s]

Wenn wir über Klima sprechen, geht es um eure Lebenszeit.
Wenn wir über Digitalisierung sprechen, geht es um eure Arbeitswelt.
Wenn wir über Demokratie sprechen, geht es um den Platz, den wir euch am Tisch freimachen. [PAUSE 1.3s]

[CRESCENDO] Wartet nicht darauf, dass euch jemand die Erlaubnis gibt, euch einzumischen. [PAUSE 1.0s]
Bringt eure Ungeduld ein. Bringt eure Ideen ein. Bringt eure Fragen in die Rathäuser, in die Betriebe, in die Parlamente. [PAUSE 1.5s]

Wir brauchen keine perfekte Generation.
Wir brauchen eine mutige Generation. [PAUSE 1.0s]
Und wenn ich in eure Gesichter sehe, weiß ich: Diese Generation ist längst da.`,
  },
  {
    id: 'speech_krise_ruhe',
    title: 'Ruhe im Gegenwind (Krisenkommunikation)',
    category: 'Krise & Führung',
    technique: 'Tiefe Ruhe, Validierung & Orientierung',
    targetWpm: 116,
    text: `[RUHIGER]
Ich weiß, dass viele von Ihnen heute Abend mit Sorge auf die nächsten Monate blicken. [PAUSE 1.6s]
Preise steigen, Gewissheiten geraten ins Wanken, und überall scheint es nur noch laute Schlagzeilen zu geben. [PAUSE 1.2s]
Diese Sorge ist berechtigt. Und wir reden sie nicht klein. [PAUSE 1.4s]

Aber in schwierigen Zeiten entscheidet nicht die Lautstärke über Stärke. [PAUSE 1.0s]
Sondern [BETONUNG] Besonnenheit. [PAUSE 1.2s]

Wir haben schon frühere Stürme nicht durch Panik überstanden.
Wir haben sie überstanden, weil wir Schritt für Schritt das Richtige getan haben. [PAUSE 1.0s]
Weil wir den Schwächsten den Rücken gestärkt haben.
Weil wir Leistungsträger entlastet haben.
Und weil wir uns nicht haben auseinanderdividieren lassen. [PAUSE 1.5s]

[CRESCENDO] Bleiben wir ruhig. Bleiben wir klar. Bleiben wir füreinander da. [PAUSE 1.2s]
Dann kommen wir durch diese Zeit nicht nur hindurch – wir gehen gestärkt aus ihr hervor.`,
  },
  {
    id: 'speech_wirtschaft_wandel',
    title: 'Wandel ohne Angst',
    category: 'Wirtschaft & Innovation',
    technique: 'Dreiklang-Steigerung & Verbindungsbrücke',
    targetWpm: 125,
    text: `[RUHIGER]
Immer wenn sich Technologie und Wirtschaft schnell verändern, stehen wir vor derselben Wahl. [PAUSE 1.2s]
Wir können versuchen, die Uhr zurückzudrehen – was noch nie funktioniert hat. [PAUSE 1.0s]
Oder wir können diesen Wandel so gestalten, dass er den Menschen dient. [PAUSE 1.4s]

Fortschritt ist kein Naturgesetz, dem wir ausgeliefert sind. [PAUSE 0.9s]
Fortschritt ist das, was [BETONUNG] wir daraus machen. [PAUSE 1.3s]

Das bedeutet: Weiterbildung, die nicht erst beginnt, wenn der Job weg ist.
Das bedeutet: Weniger Papierkrieg für den Mittelstand, damit Gründer bauen können statt Formulare zu wälzen.
Und das bedeutet: faire Spielregeln, damit Wertschöpfung auch bei denen ankommt, die sie jeden Tag erarbeiten. [PAUSE 1.5s]

[CRESCENDO] Wir müssen vor der Zukunft keine Angst haben – wenn wir mutig genug sind, sie selbst zu schreiben.`,
  },
  {
    id: 'speech_ehrenamt',
    title: 'Die leisen Stützen unseres Landes',
    category: 'Gesellschaft & Dank',
    technique: 'Empathisches Pacing & Wertschätzung',
    targetWpm: 120,
    text: `[RUHIGER]
Keine Talkshow lädt sie jeden Abend ein. [PAUSE 1.2s]
Kein Ticker meldet ihre Arbeit. [PAUSE 1.2s]
Und doch würde dieses Land ohne sie keinen einzigen Tag funktionieren. [PAUSE 1.6s]

Ich spreche von den Trainerinnen auf dem Sportplatz am Samstagmorgen.
Von den Freiwilligen bei der Feuerwehr, die nachts ausrücken, wenn andere schlafen.
Von den Nachbarn, die für ältere Menschen einkaufen gehen, ohne ein Wort darüber zu verlieren. [PAUSE 1.4s]

[CRESCENDO] Sie zeigen uns jeden Tag, was Zivilgesellschaft wirklich bedeutet: [PAUSE 0.9s]
Nicht warten, bis „irgendjemand“ etwas tut.
Sondern erkennen: [BETONUNG] Ich bin dieser Jemand. [PAUSE 1.5s]

Die Politik kann Ihnen diese Haltung nicht verordnen.
Aber wir können Ihnen den Rücken freihalten – mit weniger Bürokratie, mit verlässlicher Förderung und mit echtem Dank.
Schön, dass es Sie gibt.`,
  },
  {
    id: 'speech_demokratie_streit',
    title: 'Streiten ohne zu zerstören',
    category: 'Demokratie',
    technique: 'Reframing von Meinungsverschiedenheit',
    targetWpm: 123,
    text: `[RUHIGER]
Demokratie war nie dafür gedacht, bequem zu sein. [PAUSE 1.4s]
Wenn zehn Millionen Menschen zehn Millionen Erfahrungen mitbringen, dann wird es Reibung geben. Das ist kein Fehler des Systems – das ist sein Herzschlag. [PAUSE 1.3s]

Aber es gibt eine Grenze, die wir gemeinsam ziehen müssen: [PAUSE 1.0s]
Wir dürfen hart in der Sache streiten, ohne dem anderen das Menschsein abzusprechen. [PAUSE 1.2s]
Wir dürfen unterschiedliche Wege vorschlagen, ohne das gemeinsame Haus anzuzünden. [PAUSE 1.4s]

[CRESCENDO] Wahre Überzeugungskraft braucht keine Beleidigung. [PAUSE 0.9s]
Sie braucht das bessere Argument, den längeren Atem und die Bereitschaft, im politischen Gegner den Nachbarn zu sehen. [PAUSE 1.4s]

Lasst uns diese Kultur zurückholen. Nicht nur im Parlament – sondern schon heute in unserem eigenen Tonfall.`,
  },
  {
    id: 'speech_eigenweg',
    title: 'Warum ich antrete (Eigene Geschichte)',
    category: 'Vorstellungsrede',
    technique: 'Story of Self → Story of Us',
    targetWpm: 124,
    text: `[RUHIGER]
Ich stehe heute nicht hier, weil ich schon immer einen fertigen Lebenslauf für die Politik hatte. [PAUSE 1.4s]
Ich stehe hier, weil ich genau wie Sie gesehen habe, was passiert, wenn Dinge liegen bleiben – und was möglich wird, wenn Menschen sie anpacken. [PAUSE 1.3s]

Ich habe gelernt, dass ein [BETONUNG] Versprechen nur so viel wert ist wie die Arbeit danach.
Dass niemand allein vorankommt, wenn das Fundament wackelt.
Und dass Veränderung fast immer klein anfängt – mit Menschen, die sich nicht länger wegducken. [PAUSE 1.5s]

[CRESCENDO] Ich trete nicht an, um über andere zu reden. Ich trete an, um mit Ihnen zu arbeiten. [PAUSE 1.1s]
Für Entscheidungen, die man auch in zehn Jahren noch erklären kann.
Für ein Miteinander, das stärker ist als jede Schlagzeile. [PAUSE 1.3s]
Lassen Sie uns diesen Weg gemeinsam gehen.`,
  },
  {
    id: 'speech_aufbruch',
    title: 'Der lange Atem des Wandels',
    category: 'Motivation & Ausdauer',
    technique: 'Anapher-Steigerung bis zum Schlussakkord',
    targetWpm: 126,
    text: `[RUHIGER]
Veränderung kommt selten auf einen Schlag. [PAUSE 1.4s]
Meistens beginnt sie als Gedanke, über den andere zunächst den Kopf schütteln. [PAUSE 1.1s]

Man wird Ihnen sagen: Das ist zu kompliziert.
Man wird Ihnen sagen: Dafür gibt es keine Mehrheit.
Man wird Ihnen sagen: So haben wir das schon immer gemacht. [PAUSE 1.5s]

[CRESCENDO] Aber fast alles, worauf wir heute stolz sind, war einmal „unmöglich“ – [PAUSE 1.0s]
bis Menschen aufgestanden sind und es einfach versucht haben. [PAUSE 1.3s]

Also lassen wir uns nicht von Zynismus bremsen.
Gehen wir Schritt für Schritt. Hören wir zu. Bleiben wir hartnäckig. [PAUSE 1.2s]
Und vergessen wir nie, für wen wir das tun: [BETONUNG] für die Menschen, die auf uns zählen.`,
  },
];

export const WORD_CHALLENGE_TOPICS = [
  'Wie stärken wir das Vertrauen in unsere Demokratie?',
  'Bezahlbare Energie und Klimaschutz für normale Haushalte',
  'Wie halten wir den ländlichen Raum lebendig und attraktiv?',
  'Chancengleichheit in unseren Schulen und Kitas',
  'Sicherheit und Zusammenhalt in unseren Innenstädten',
  'Digitalisierung der Verwaltung: Schluss mit dem Papierstau',
  'Fachkräftemangel lösen durch echte Wertschätzung von Arbeit',
  'Wie schützen wir Vereine und Ehrenamt vor Bürokratie?',
  'Generationengerechtigkeit bei Rente und Investitionen',
  'Wirtschaftswachstum und ökologische Verantwortung vereinen',
  'Bezahlbarer Wohnraum für Familien, Azubis und Senioren',
  'Wie gehen wir als Gesellschaft mit Polarisierung um?',
  'Pflege und Gesundheit: Entlastung für die, die helfen',
  'Mobilität der Zukunft für Stadt und Land',
  'Warum ehrliche Fehlerkultur in der Politik Stärke zeigt',
  'Integration durch Arbeit, Sprache und klare Regeln',
  'Europa in unsicheren Zeiten: Warum Einigkeit jetzt zählt',
  'Kinderarmut bekämpfen – jede Biografie zählt',
  'Künstliche Intelligenz in Schule, Betrieb und Alltag',
  'Bürgerbeteiligung vor Ort: Vom Zuhören zum Handeln',
  'Saubere Energie und bezahlbare Industrieproduktion',
  'Verlässliche Infrastruktur: Brücken, Schienen und Netze',
  'Einsamkeit im Alter und Druck auf pflegende Angehörige',
  'Wie holen wir Politikverdrossene zurück an den Tisch?',
];

export const WORD_CHALLENGE_POOLS = {
  leicht: [
    'Vertrauen', 'Zukunft', 'Nachbarschaft', 'Verantwortung', 'Fairness',
    'Chancen', 'Zusammenhalt', 'Respekt', 'Bildung', 'Sicherheit',
    'Transparenz', 'Mut', 'Wandel', 'Heimat', 'Lösung', 'Dialog',
    'Gerechtigkeit', 'Fortschritt', 'Verlässlichkeit', 'Gemeinschaft',
  ],
  mittel: [
    'Brücke', 'Fundament', 'Gegenwind', 'Kompass', 'Handwerk',
    'Alltag', 'Geduld', 'Aufbruch', 'Versprechen', 'Balance',
    'Horizont', 'Rückenwind', 'Werkzeug', 'Schnittstelle', 'Tempo',
    'Meilenstein', 'Wurzel', 'Perspektive', 'Klammer', 'Anker',
  ],
  profi: [
    'Morgenlicht', 'Kaffeehaus', 'Kompassnadel', 'Baustelle', 'Uhrwerk',
    'Schlüsselbund', 'Rückenmark', 'Regenschirm', 'Echo', 'Leuchtturm',
    'Knotenpunkt', 'Feuerprobe', 'Taktgeber', 'Sprungbrett', 'Schatten',
    'Schatzkarte', 'Sturmflut', 'Werkbank', 'Puzzleteil', 'Zündfunke',
  ],
};

export const STYLE_DRILLS = [
  {
    id: 'drill_dreiklang',
    title: 'Der Dreiklang (Trikolon)',
    formula: '[Punkt 1], [Punkt 2] und [stärkster Punkt 3]',
    exampleBefore: 'Wir müssen die Schulen sanieren und bessere Busse haben und alles digitaler machen.',
    exampleAfter:
      'Wir brauchen Schulen, die begeistern, Busse, die pünktlich fahren, und einen Staat, der wieder im 21. Jahrhundert ankommt.',
    prompts: [
      'Formuliere einen Dreiklang darüber, was gute politische Führung ausmacht.',
      'Formuliere einen Dreiklang für die Zukunft deiner Heimatstadt.',
      'Nutze „Nicht X, nicht Y, sondern Z“ zum Thema soziale Gerechtigkeit.',
      'Formuliere einen Dreiklang über Respekt gegenüber Pflegekräften und Handwerkern.',
      'Baue einen Dreiklang zum Thema bezahlbares Wohnen in wachsenden Städten.',
    ],
  },
  {
    id: 'drill_anapher',
    title: 'Die Anapher (Rhythmische Wiederholung)',
    formula: 'Gleicher Satzanfang 3× hintereinander bis zur Pointe',
    exampleBefore: 'Wir wollen mehr Freiheit, und außerdem ist uns Sicherheit wichtig. Und Chancen zählen auch.',
    exampleAfter:
      'Wir glauben an ein Land, das Leistung belohnt. Wir glauben an ein Land, das niemanden zurücklässt. Und wir glauben an ein Land, das mutig nach vorne blickt.',
    prompts: [
      'Starte 3 Sätze mit „Es geht um…“ zum Thema bezahlbares Leben.',
      'Starte 3 Sätze mit „Wir wissen…“ zum Thema Klimawandel & Innovation.',
      'Starte 3 Sätze mit „Stell dir vor…“ über deine Vision in 10 Jahren.',
      'Starte 3 Sätze mit „Veränderung beginnt…“ über Demokratie im Alltag.',
      'Starte 3 Sätze mit „Wir stehen für…“ für eine klare politische Haltung.',
    ],
  },
  {
    id: 'drill_kontrast',
    title: 'Der Kontrast-Pivot (Antithese)',
    formula: '„Es geht nicht um [Spaltung/Vergangenheit] – es geht um [Gemeinsamkeit/Zukunft].“',
    exampleBefore: 'Die Opposition liegt falsch, wir haben die besseren Zahlen.',
    exampleAfter:
      'Diese Debatte dreht sich nicht um Parteipunkte auf dem Papier. Sie dreht sich um die Frage, ob eine Familie am Monatsende ruhig schlafen kann.',
    prompts: [
      'Drehe das Thema „Steuern & Investitionen“ mit einem Kontrast-Pivot.',
      'Drehe einen Vorwurf „Sie sind zu jung/neu“ in eine Stärke mit „Es geht nicht um… sondern um…“.',
      'Verbinde Stadt und Land mit einem Kontrast-Satz.',
      'Löse das Thema „Sicherheit vs. Freiheit“ in einem Kontrast-Pivot auf.',
      'Verbinde Wirtschaftsstärke und Klimaschutz mit „Nicht A gegen B, sondern…“.',
    ],
  },
  {
    id: 'drill_appell',
    title: 'Der 3-Satz-Appell (Self · Us · Now)',
    formula: '1× Eigene Beobachtung → 1× Gemeinsame Realität → 1× Klare Entscheidung heute',
    exampleBefore: 'Ich finde das Problem wichtig und wir sollten alle zusammen etwas ändern.',
    exampleAfter:
      'Letzte Woche stand ich am leeren Bahnsteig im Regen. Tausende Pendler kennen genau dieses Gefühl des Wartens. Deshalb investieren wir ab heute in verlässliche Schienen statt in Ausreden.',
    prompts: [
      'Verbinde eine persönliche Alltagsszene mit einem klaren „Wir“-Appell zur Bildung.',
      'Starte mit einem Gespräch am Küchentisch und führe zur gemeinsamen Verantwortung.',
      'Erkläre in 3 Sätzen, warum Ehrenamt das Rückgrat deiner Gemeinde ist.',
      'Verwandle Frust über Bürokratie in einen konkreten 3-Satz-Aufbruch.',
    ],
  },
];

export const GEGENWIND_QUESTIONS = [
  {
    tag: 'Zynismus',
    question:
      '„Das klingt ja alles nett – aber am Ende reden Politiker doch immer nur schön, und für meinen Geldbeutel ändert sich nichts!“',
    tip: '1. Pause (2s). 2. Validieren („Sie haben jedes Recht, skeptisch zu sein.“). 3. Konkretes Beispiel. 4. Einladung.',
  },
  {
    tag: 'Erfahrung',
    question:
      '„Sie haben doch gar nicht die politische Erfahrung für so ein Amt – warum sollten wir Ihnen das zutrauen?“',
    tip: 'Vermeide Verteidigung! Pivot: „Erfahrung misst sich nicht nur in Dienstjahren im Gremium, sondern darin, ob man die Probleme des Alltags kennt…“',
  },
  {
    tag: 'Finanzierung',
    question:
      '„Tolle Visionen! Aber wer soll das alles bezahlen? Sie versprechen doch Dinge, für die kein Geld da ist!“',
    tip: 'Zeige Prioritäten-Klarheit: „Gerade weil Geld knapp ist, müssen wir ehrlich rechnen…“ + Dreiklang aus Sparen/Investieren/Wirkung.',
  },
  {
    tag: 'Spaltung',
    question:
      '„Warum nehmen Sie die Sorgen der anderen Seite nicht ernst? Sie machen doch Politik nur für Ihre eigene Blase!“',
    tip: 'Obamas Signature-Empathie: Wiederhole das beste Argument des Kritikers fair in eigenen Worten, bevor du deine Brücke baust.',
  },
  {
    tag: 'Ungeduld',
    question:
      '„Warum dauert das alles so lange? Die Leute warten seit Jahren auf Entscheidungen!“',
    tip: 'Teile die Ungeduld („Mich ärgert dieses Tempo genauso.“), erkläre kurz den Engpass, nenne den ersten konkreten Schritt.',
  },
  {
    tag: 'Vergleich',
    question:
      '„Wollen Sie hier etwa nur amerikanische Show-Rhetorik kopieren statt deutsche Sachpolitik zu machen?“',
    tip: 'Lächeln, Pause, souverän: „Gute Sprache ersetzt keine Sachpolitik – aber ohne klare Sprache erreicht gute Sachpolitik niemanden.“',
  },
  {
    tag: 'Fehlerfrage',
    question:
      '„Haben Sie oder Ihre Seite in diesem Punkt nicht selbst Fehler gemacht? Warum sollten wir Ihnen jetzt glauben?“',
    tip: 'Fehler offen eingestehen („Ja, da lag man zu langsam / falsch.“) — nichts schafft schneller Vertrauen als ehrliche Selbstkritik.',
  },
  {
    tag: 'Klima vs. Wirtschaft',
    question:
      '„Ihre Klimapläne kosten doch nur Arbeitsplätze in unserer Region!“',
    tip: 'Falsches Entweder-Oder auflösen: „Wenn wir nichts tun, verlieren wir die Märkte von morgen. Unser Job ist beides: Klimaschutz UND sichere Industriearbeitsplätze.“',
  },
  {
    tag: 'Bürokratie',
    question:
      '„Jede neue Vorschrift lähmt unseren Handwerksbetrieb – warum erfinden Sie immer neue Regeln?“',
    tip: 'Zustimmung zeigen, dann differenzieren: „Wer arbeitet, braucht Rückenwind statt Formulare. Lassen Sie uns klar unterscheiden zwischen Schutz und Papierkrieg.“',
  },
  {
    tag: 'Generationen',
    question:
      '„Ihr macht Politik entweder nur für Rentner oder nur für Junge – wie soll das je gerecht werden?“',
    tip: 'Brücken-Pivot: „Eine Enkelin profitiert von stabilen Renten ihrer Großeltern, und Großeltern profitieren von starken Schulen. Generationen gehören an denselben Tisch.“',
  },
  {
    tag: 'Wohnen',
    question:
      '„Seit Jahren wird über bezahlbare Mieten geredet – passiert ist in unserem Viertel gar nichts!“',
    tip: 'Nicht beschönigen! Konkrete Engpässe benennen (Genehmigung, Boden, Baukosten) und einen klaren 3-Schritte-Plan vorstellen.',
  },
  {
    tag: 'Europa',
    question:
      '„Warum sollen wir immer weiter Geld nach Brüssel schicken, wenn vor unserer eigenen Haustür Brücken bröckeln?“',
    tip: 'Beide Interessen verbinden: „Starke Kommunen vor Ort und ein handlungsfähiges Europa sind kein Gegensatz – ein starker Binnenmarkt finanziert erst unseren Wohlstand vor Ort.“',
  },
  {
    tag: 'Social Media',
    question:
      '„In den sozialen Medien heißt es, Sie drücken sich vor klaren Ja-oder-Nein-Antworten!“',
    tip: 'Ruhige Autorität: „Komplexe Probleme passen selten in fünf Sekunden Empörung. Meine Haltung ist eindeutig – und ich erkläre Ihnen gerne die zwei Gründe dahinter.“',
  },
  {
    tag: 'Infrastruktur',
    question:
      '„Die Züge kommen zu spät, das Netz reißt ab – warum sollte der Staat überhaupt irgendetwas besser hinbekommen?“',
    tip: 'Ehrlich anerkennen, dann Hoffnung über Handlungsfähigkeit aufbauen: „Genau deshalb brauchen wir Prioritäten, Tempo bei Planungen und klare Verantwortung.“',
  },
];

export const LESSONS = [
  {
    id: 'lesson_01_pausen',
    num: '01',
    title: 'Die Obama-Sekunde: Wirkungspausen setzen',
    dimension: 'pausen',
    mode: 'spontan',
    durationSec: 45,
    summary: 'Lerne, nach Kernaussagen 1,2–2,0 Sekunden echte Stille auszuhalten statt Lücken mit „ähm“ zu füllen.',
    theory: 'Unsichere Redner fürchten Stille und beschleunigen nach wichtigen Sätzen. Staatsmänner setzen einen Punkt — und lassen den Raum 1,5 Sekunden arbeiten.',
    exampleBefore: 'Wir müssen das jetzt anpacken und ähem deshalb brauchen wir neue Ideen in der Stadt.',
    exampleAfter: 'So wie bisher kann es nicht bleiben. [1,5s Stille] Genau deshalb fangen wir heute an.',
    taskPrompt: 'Erkläre in 45 Sekunden, welche Sache in deiner Stadt oder deinem Alltag sich als Erstes verbessern muss. Setze nach deinen 3 wichtigsten Sätzen bewusst 1,5 Sekunden Pause.',
    checklist: [
      'Mindestens 3 hörbare Wirkungspausen (>= 0,8s)',
      'Pausenanteil ideal zwischen 12 % und 32 %',
      'Gesamtwertung der Lektion mindestens 70/100',
    ],
    passRule: { minScore: 70, minPauses: 3 },
  },
  {
    id: 'lesson_02_tempo',
    num: '02',
    title: 'Staatsmann-Tempo: Souveräne 125 WPM',
    dimension: 'tempo',
    mode: 'teleprompter',
    durationSec: 55,
    summary: 'Finde den ruhigen Obama-Korridor zwischen 115 und 135 Wörtern pro Minute ohne Hast.',
    theory: 'Wer über 150 WPM spricht, klingt getrieben und signalisiert Rechtfertigungsdruck. Bei ~125 WPM wirkt jeder Satz abgewogen und glaubwürdig.',
    exampleBefore: 'Zu schnelles Durchrattern von Statistiken und Forderungen ohne Atemraum.',
    exampleAfter: 'Gleichmäßiger Fluss mit bewusster Betonung auf Schlüsselwörtern und ruhigen Atempausen.',
    taskPrompt: 'Lies den folgenden Text laut und ruhig im Korridor 115–135 WPM vor. Hetze bei keinem Satz.',
    referenceText: `[RUHIGER]
Vertrauen entsteht nicht auf Plakaten. [PAUSE 1.4s]
Vertrauen entsteht dort, wo Worte und Taten im Alltag zusammenpassen. [PAUSE 1.2s]
Wenn ein Bus pünktlich kommt. Wenn ein Antrag nicht Monate dauert. Wenn ein Versprechen auch nach der Wahl noch gilt. [PAUSE 1.5s]
[CRESCENDO] Genau dieses Maß an [BETONUNG] Verlässlichkeit wollen wir gemeinsam zurückholen.`,
    checklist: [
      'Sprechtempo im ruhigen Korridor (105–145 WPM)',
      'Klare Texttreue und saubere Pausen',
      'Gesamtwertung der Lektion mindestens 72/100',
    ],
    passRule: { minScore: 72, wpmMin: 105, wpmMax: 145 },
  },
  {
    id: 'lesson_03_satzende',
    num: '03',
    title: 'Tonfall & Satzende nach unten',
    dimension: 'dynamik',
    mode: 'teleprompter',
    durationSec: 50,
    summary: 'Vermeide fragendes „Uptalk“ am Satzende und baue ein hörbares Crescendo vom ruhigen Einstieg bis zum Schluss auf.',
    theory: 'Wenn die Stimmlage am Satzende nach oben geht, klingt eine Aussage wie eine Bitte um Erlaubnis. Senke den Ton auf dem letzten Wort ruhig ab.',
    exampleBefore: '„Wir können das schaffen? Und wir brauchen mehr Mut?“ (fragende Endmelodie)',
    exampleAfter: '„Wir können das schaffen. Und wir fangen heute damit an.“ (tiefer, ruhiger Punkt)',
    taskPrompt: 'Sprich diesen Abschnitt mit ruhigem, tiefem Einstieg, klar absinkenden Satzenden und spürbarer Energie-Steigerung beim [CRESCENDO].',
    referenceText: `[RUHIGER]
Niemand hat uns versprochen, dass Veränderung bequem wird. [PAUSE 1.4s]
Aber Bequemlichkeit hat noch nie ein Problem gelöst. [PAUSE 1.2s]
Wir definieren uns nicht durch die Hürden vor uns.
[CRESCENDO] Wir definieren uns durch den [BETONUNG] Mut, sie Schritt für Schritt aus dem Weg zu räumen. [PAUSE 1.4s]
Packen wir es an.`,
    checklist: [
      'Ruhig beginnen, zum Finale spürbar steigern',
      'Satzenden sicher nach unten abschließen',
      'Gesamtwertung der Lektion mindestens 72/100',
    ],
    passRule: { minScore: 72 },
  },
  {
    id: 'lesson_04_dreiklang',
    num: '04',
    title: 'Die Architektur des Dreiklangs (Trikolon)',
    dimension: 'stilmittel',
    mode: 'spontan',
    durationSec: 50,
    summary: 'Bündle Argumente in rhythmischen Dreiergruppen („A, B und stärkstes C“) für sofortige Einprägsamkeit.',
    theory: 'Das Gehirn verarbeitet Dreiergruppen als vollständig und überzeugend. Obama baut nahezu jede Schlüsselpassage auf genau drei Elementen auf.',
    exampleBefore: 'Wir müssen Bildung verbessern und das Klima schützen.',
    exampleAfter: 'Wir kämpfen für Schulen, die Talente wecken, für Betriebe, die Zukunft bauen, und für ein Miteinander, das niemanden zurücklässt.',
    taskPrompt: 'Sprich 50 Sekunden zum Thema „Was unsere Gesellschaft jetzt zusammenhält“ und baue mindestens einen bewussten Dreiklang ein.',
    checklist: [
      'Mindestens 1 klares Stilmittel (Dreiklang/Anapher/Kontrast)',
      'Sichtbarer Aufbau vom ersten bis zum dritten Punkt',
      'Gesamtwertung der Lektion mindestens 70/100',
    ],
    passRule: { minScore: 70, minDevices: 1 },
  },
  {
    id: 'lesson_05_kontrast',
    num: '05',
    title: 'Kontrast-Brücken statt Entweder-Oder',
    dimension: 'stilmittel',
    mode: 'spontan',
    durationSec: 55,
    summary: 'Löse politische Scheingegensätze mit Antithesen auf („Es geht nicht um X – es geht um Y“).',
    theory: 'Polarisierende Debatten leben von falschen Alternativen. Der Kontrast-Pivot hebt die Diskussion auf eine gemeinsame Ebene.',
    exampleBefore: 'Man muss sich zwischen Wirtschaft und Umweltschutz entscheiden.',
    exampleAfter: 'Es geht nicht um Wirtschaft gegen Klimaschutz. Es geht darum, wie wir Arbeitsplätze von morgen heute sichern.',
    taskPrompt: 'Löse in 55 Sekunden einen scheinbaren Gegensatz (z. B. Stadt vs. Land oder Alt vs. Jung) mit einer klaren Kontrast-Brücke auf.',
    checklist: [
      'Mindestens 1 Kontrast-Brücke / Antithese erkannt',
      'Beide Perspektiven fair anerkannt und verbunden',
      'Gesamtwertung der Lektion mindestens 72/100',
    ],
    passRule: { minScore: 72, minDevices: 1 },
  },
  {
    id: 'lesson_06_wir',
    num: '06',
    title: 'Vom „Ich“ zum „Wir“ & Werte-Anker',
    dimension: 'wirCharisma',
    mode: 'spontan',
    durationSec: 55,
    summary: 'Mache das Publikum zum Hauptakteur deiner Rede und verankere Argumente in geteilten Werten.',
    theory: 'Zuhörer folgen nicht jemandem, der nur über sich spricht. Verbinde persönliche Erfahrung mit „wir“, „uns“ und Werten wie Vertrauen, Fairness oder Verantwortung.',
    exampleBefore: 'Ich habe ein Konzept geschrieben und ich werde das jetzt durchsetzen.',
    exampleAfter: 'Wir wissen alle, was auf dem Spiel steht. Wenn wir Verantwortung teilen, entsteht neues Vertrauen in unsere Zukunft.',
    taskPrompt: 'Halte eine 55-Sekunden-Einladung zum Mitmachen an Menschen in deiner Gemeinde. Nutze starkes „Wir“-Framing und mindestens zwei Werte-Begriffe.',
    checklist: [
      'Mindestens 2× inklusives „Wir / Uns / Unser“',
      'Mindestens 1 klarer Werte-Begriff (z. B. Vertrauen, Verantwortung)',
      'Gesamtwertung der Lektion mindestens 72/100',
    ],
    passRule: { minScore: 72, minWeCount: 2 },
  },
  {
    id: 'lesson_07_klarheit',
    num: '07',
    title: 'Null Füllwörter unter Zeitdruck',
    dimension: 'klarheit',
    mode: 'wort-challenge',
    durationSec: 60,
    summary: 'Verwebe vorgegebene Pflichtbegriffe spontan in klare Sätze — ohne „ähm“, „halt“ oder „irgendwie“.',
    theory: 'Füllwörter entstehen genau in der Sekunde, in der wir nach dem nächsten Wort suchen. Ersetze jedes „ähm“ durch eine kurze Denkpause — die wirkt sofort souverän.',
    exampleBefore: 'Da müssen wir halt irgendwie sozusagen eine Lösung finden, ähm damit Vertrauen entsteht.',
    exampleAfter: 'Dafür brauchen wir eine klare Lösung. [Pause] Nur so wächst wieder Vertrauen in unseren Alltag.',
    taskPrompt: 'Thema: „Wie wird Politik wieder greifbar?“ — Baue alle 3 Pflichtwörter organisch ein und bleibe bei maximal 1 Füllwort.',
    mandatoryWords: ['Vertrauen', 'Alltag', 'Lösung'],
    checklist: [
      'Maximal 1 Füllwort im gesamten Transkript',
      'Alle 3 Pflichtwörter organisch integriert',
      'Gesamtwertung der Lektion mindestens 74/100',
    ],
    passRule: { minScore: 74, maxFillers: 1 },
  },
  {
    id: 'lesson_08_crescendo',
    num: '08',
    title: 'Die 60-Sekunden-Mini-Rede (Meisterstück)',
    dimension: 'dynamik',
    mode: 'spontan',
    durationSec: 60,
    summary: 'Verbinde alle Techniken: ruhiger Einstieg, Wirkungspausen, Dreiklang, Wir-Fokus und ein kraftvoller Schluss.',
    theory: 'Große Wirkung entsteht durch Kontrast: 20 Sekunden ruhig erzählen, 20 Sekunden klar argumentieren, 20 Sekunden mit Überzeugung abschließen.',
    exampleBefore: 'Gleichförmiger Vortrag ohne Spannungsbogen und abruptes Ende.',
    exampleAfter: 'Konkreter Auftakt → Pause → Kontrast & Dreiklang → ruhige Pointe am Schluss.',
    taskPrompt: 'Halte eine freie 60-Sekunden-Rede über eine Veränderung, für die du persönlich einstehst. Nutze Einstiegsszene, Kontrast, Dreiklang und eine bewusste Schlusspause.',
    checklist: [
      'Ausgewogene Kadenz über alle Dimensionen',
      'Klares Stilmittel oder starkes „Wir“-Finale',
      'Gesamtwertung der Lektion mindestens 75/100',
    ],
    passRule: { minScore: 75 },
  },
];

export const RATED_TESTS = [
  {
    id: 'test_kadenz',
    num: 'Prüfung 01',
    title: 'Kadenz-, Tempo- & Pausen-Test',
    mode: 'teleprompter',
    durationSec: 65,
    passScore: 80,
    dimensionsLabel: 'Tempo · Pausen · Dynamik · Klarheit',
    description: 'Prüft deine stimmliche Kontrolle beim Ablesen: ruhiges Tempo (115–135 WPM), echte Pausen, sinkende Satzenden und Crescendo.',
    prompt: 'Lies den Prüfungstext exakt mit allen Regiezeichen per Mikrofon vor. Achte besonders auf die 1,5s-Pausen.',
    referenceText: `[RUHIGER]
Man sagt uns in diesen Monaten oft, unsere Gesellschaft sei zu zerstritten für echte Lösungen. [PAUSE 1.5s]
Dass die Gräben zwischen Jung und Alt, zwischen Stadt und Land, zwischen Skepsis und Aufbruch zu tief geworden seien. [PAUSE 1.2s]

Aber sehen Sie genau hin: [PAUSE 1.0s]
Die Menschen erwarten keine perfekten Wunder über Nacht.
Sie erwarten Ehrlichkeit. Sie erwarten Respekt. Und sie erwarten eine Politik, die wieder [BETONUNG] zuhört. [PAUSE 1.5s]

[CRESCENDO] Es geht nicht darum, wer am lautesten ruft.
Es geht darum, wer Verantwortung übernimmt, wenn es schwierig wird. [PAUSE 1.2s]
Fangen wir genau dort an – ruhig, klar und gemeinsam.`,
    mandatoryWords: [],
  },
  {
    id: 'test_architektur',
    num: 'Prüfung 02',
    title: 'Stilmittel- & Werte-Prüfung (60s)',
    mode: 'spontan',
    durationSec: 60,
    passScore: 78,
    dimensionsLabel: 'Alle 6 Dimensionen · Schwerpunkt Stilmittel & Wir',
    description: 'Bewertet deine freie Rede auf rhetorische Architektur: Dreiklang, Kontrast-Pivot, „Wir“-Framing und Werte-Tiefe.',
    prompt: 'Freie 60-Sekunden-Rede: „Warum lohnt sich Engagement für unsere Demokratie gerade heute?“ — Nutze mindestens einen Dreiklang, eine Kontrast-Brücke und starkes „Wir“-Framing.',
    mandatoryWords: [],
  },
  {
    id: 'test_gegenwind',
    num: 'Prüfung 03',
    title: 'Gegenwind- & Pflichtwort-Prüfung (75s)',
    mode: 'wort-challenge',
    durationSec: 75,
    passScore: 78,
    dimensionsLabel: 'Alle 6 Dimensionen · Schwerpunkt Klarheit & Souveränität',
    description: 'Simuliert kritischen Gegenwind unter Zeitdruck mit drei Pflichtbegriffen und strenger Füllwort-Prüfung.',
    prompt: 'Antworte ruhig und souverän auf den Vorwurf: „Politiker reden doch nur schön – für unseren Alltag ändert sich nichts!“ Baue alle 3 Pflichtwörter organisch ein.',
    mandatoryWords: ['Verantwortung', 'Brücke', 'Vertrauen'],
  },
  {
    id: 'test_grundsatz',
    num: 'Prüfung 04',
    title: 'Große 90-Sekunden-Grundsatzrede',
    mode: 'spontan',
    durationSec: 90,
    passScore: 82,
    dimensionsLabel: 'Alle 6 Dimensionen (Vollwertung)',
    description: 'Vollständige freie Grundsatzrede mit Spannungsbogen (Story of Self → Us → Now), Stimm-Dynamik und Pointen-Schärfe.',
    prompt: 'Halte eine 90-Sekunden-Grundsatzrede zu deiner politischen Kernvision: Was steht für dich auf dem Spiel, was verbindet uns alle, und was tun wir heute?',
    mandatoryWords: [],
  },
  {
    id: 'test_staatsmann',
    num: 'Prüfung 05',
    title: 'Staatsmann-Zertifikat (Master-Prüfung)',
    mode: 'wort-challenge',
    durationSec: 120,
    passScore: 85,
    dimensionsLabel: 'Alle 6 Dimensionen (höchster Maßstab)',
    description: 'Die anspruchsvollste Abschlussprüfung über 2 Minuten mit 4 Pflichtwörtern: ruhige Kadenz, Dynamik-Crescendo, Stilmittel und volle Klarheit.',
    prompt: 'Halte eine zweiminütige Schlussrede für eine Townhall-Versammlung zum Thema „Aufbruch in unsicheren Zeiten“. Integriere alle 4 Pflichtwörter nahtlos.',
    mandatoryWords: ['Fundament', 'Zusammenhalt', 'Gegenwind', 'Zukunft'],
  },
];

export const PLAYBOOK_PILLARS = [
  {
    num: '01',
    title: 'Die Obama-Sekunde (Pausenmut)',
    summary:
      'Unsichere Redner füllen jede Stille mit „ähm“ oder Tempo. Obama setzt nach einem starken Satz 1,5 Sekunden Stille — und zwingt den Raum zum Nachdenken.',
    phrases: [
      '„Lassen Sie mich das ganz deutlich sagen: [PAUSE 1.5s] …“',
      '„Und genau das ist der Punkt. [PAUSE 1.5s]“',
    ],
  },
  {
    num: '02',
    title: 'Tempo & Stimm-Anker (~125 WPM)',
    summary:
      'Sprich etwa 20 % langsamer als im Alltagsgespräch. Starte ruhig und warm — und steigere Lautstärke und Entschlossenheit erst im letzten Drittel (Crescendo).',
    phrases: [
      'Einstieg tief & ruhig: „Ich weiß, wie schwer die letzten Monate waren.“',
      'Finale mit Zug: „Aber wir definieren uns nicht über unsere Angst – wir definieren uns über unseren Mut.“',
    ],
  },
  {
    num: '03',
    title: 'Der Dreiklang (Trikolon)',
    summary:
      'Unser Gehirn liebt Dreiergruppen. Zwei Beispiele wirken zufällig, vier ermüden — drei wirken vollständig, rhythmisch und staatsmännisch.',
    phrases: [
      '„Nicht durch Spaltung, nicht durch Angst, sondern durch gemeinsamen Anpacken.“',
      '„Für faire Löhne, für starke Schulen und für ein Land, das zusammenhält.“',
    ],
  },
  {
    num: '04',
    title: 'Kontrast-Brücken (Antithese)',
    summary:
      'Obama gewinnt Debatten, indem er falsche Gegensätze („entweder/oder“) in ein übergeordnetes „Sowohl-als-auch“ verwandelt.',
    phrases: [
      '„Es geht nicht um Alt gegen Jung. Es geht darum, was wir gemeinsam hinterlassen.“',
      '„Wir brauchen nicht weniger Staat und nicht mehr Bürokratie – wir brauchen einen klugen Staat.“',
    ],
  },
  {
    num: '05',
    title: 'Story of Self → Us → Now (Deine Herkunft!)',
    summary:
      'Du brauchst nicht Obamas Biografie! Menschen spüren Authentizität. Nimm ein echtes Erlebnis aus deinem Leben (Self), zeige die universelle Erfahrung darin (Us) und verbinde sie mit dem heutigen Handeln (Now).',
    phrases: [
      'Self: „Als ich damals in [Ort/Situation] erlebt habe…“',
      'Us: „Und ich weiß, dass viele von Ihnen genau dieses Gefühl kennen…“',
      'Now: „Deshalb stehen wir heute hier, um das gemeinsam zu ändern.“',
    ],
  },
  {
    num: '06',
    title: 'Vom „Ich“ zum „Wir“',
    summary:
      'Eitle Redner sagen ständig „Ich werde…“. Charismatische Führer machen das Publikum zum Hauptdarsteller: „Wir können…“, „Sie verdienen…“.',
    phrases: [
      'Statt „Ich habe einen Plan“ → „Unser gemeinsamer Weg beginnt damit, dass wir…“',
    ],
  },
  {
    num: '07',
    title: 'Ruhige Autorität im Gegenwind',
    summary:
      'Bei Angriffen niemals gereizt zurückbeißen. Kurz lächeln, tief atmen, den wahren Kern im Anliegen des Kritikers anerkennen — und dann souverän einordnen.',
    phrases: [
      '„Ich verstehe Ihren Frust über diesen Punkt absolut. Lassen Sie uns kurz schauen, woran es wirklich hakt…“',
    ],
  },
];
