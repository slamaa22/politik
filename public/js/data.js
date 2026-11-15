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
