const Groq = require('groq-sdk');
// Path to your JSON data
const chunksData = require('../public/dnd-chunks.json'); 

const groq = new Groq({
  // VITAL: This reads the invisible key from Vercel Settings
  apiKey: process.env.GROQ_API_KEY, 
});

// Helper function to find context
function findRelevantChunks(query, chunks, topK = 4) {
  if (!chunks) return [];
  
  const queryTerms = query.toLowerCase().split(/\s+/);
  
  const scored = chunks.map((chunk, idx) => {
    const chunkLower = chunk.toLowerCase();
    let score = 0;
    queryTerms.forEach(term => {
      if (chunkLower.includes(term)) score++;
      // Give extra points for exact matches to improve relevance
      score += (chunkLower.match(new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length * 0.5;
    });
    return { chunk, score, idx };
  });
  
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(item => item.chunk);
}

module.exports = async (req, res) => {
  // 1. CORS Headers (Allows your frontend to talk to this backend)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle browser pre-checks
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // SECURITY CHECK: Fail fast if the API key is missing in Vercel
    if (!process.env.GROQ_API_KEY) {
      console.error('SERVER ERROR: GROQ_API_KEY is missing in environment variables.');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    // 2. Prepare Context
    // We use "|| []" to prevent crashing if the json is empty
    const relevantChunks = findRelevantChunks(message, chunksData.chunks || []);
    const context = ' I. PRIMARY CHARACTERS (Player Characters)
Reigen Arlondwright
Race: Changeling (closeted, experiences racism)
Class: Exorcist/Charlatan
Affiliations: Former Fathom Ink employee, GalaxyBucks "employee" (undercover)
Key Traits: Master of disguise, silver-tongued, business-minded
Signature Moves: Identity spells, silvery barbs, business card distribution
Important Relationships:
Frank (repeat client)
Johnny Mythrilhand (revolution ally)
Gloria Slugbottom (reluctant mentor)
Current Quests: Infiltrating GalaxyBucks from within
Johnny Mythrilhand
Race: Human (resurrected consciousness in new body)
Class: Gunslinger/Warlock (Alt as patron)
True Age: 90+ years (died 100 years ago, resurrected via AI)
Affiliations: Former Fathom Ink, Rebis whistleblower, Banana Guard "Brother of the Peel"
Key Traits: Celebrity status, cybernetic left arm (Mythrilhand), carries guilt over girlfriend's death
AI Companion: Alt (manifested consciousness, has "eternal shotgun")
Notable Feats: Survived Ultimum Ink capture, blew whistle making them criminal organization
Key Equipment: Guns, cooling stone, guitar (recorded on data crystal)
Chimer
Race: Unknown (possibly ancient civilization descendant)
Class: Druid/Warlock hybrid
True Age: 2,500 years old (appears 25-27)
Key Traits: Last of his kind, unknown species, ancestral gene connects to all races
Signature Abilities: Witchbolt (trauma-associated), druidcraft, shapeshifting resistance
Important Connections: Father (military man, different species), Hasan (spirit-release ally)
Rebis Connection: Flashbacks to green embryonic fluid tank, Rubedo symbol
Romantic Interests: Hillary (student), Fairy (masquerade)
Hui Newton
Race: Android/Robot (created by Newton)
Class: Technomancer/Artificer
Creator: Newton (deceased Rebis scientist)
Robots: Mewtwo → Mewthree → Mewfour (progressive upgrades)
Key Traits: Looks exactly like Newton, "final creation," technomancer savant
Affiliations: Rebis legacy, Gloria's protégé
Significant Abilities: Barrier hacking, robot control, surveillance manipulation
Quest: Learn to take Gloria's place as Rebis "Brain"
Tabaga
Race: Orc/Goliath hybrid (implied)
Class: Wrestler/Fighter
Home: Cupie (jungle planet)
Key Traits: Emotional, strong, arch-rivalry with Goldstein
Family: Parents deceased (dating app creators), house condemned
Signature Move: Throws rotten apples with deadly accuracy
Current Status: Publicly "dead" after Aphrodite CEO attack
Bob
Race: Plasmoid (oozes from destroyed robots)
Class: Spy/Psionic Assassin
Affiliations: Spy network (handler: Elizabeth), Shimana Clan notice
Key Traits: Master of disguise, vent infiltration, psychic daggers
Signature Moves: Psychic dagger stairs, vent navigation, poisoning (diluted)
Current Missions:
Ruin DJ Smooch.exe career (assigned)
Assassinate Tabaga (assigned, planning to fail)
Backstory: Gained consciousness on generational ship, watched families
II. MAJOR NPCs (By Location/Faction)
Rebis Foundation Members (Original Team)
Table
Copy
Name	Nickname	Status	Role	Notes
Bosh Kyros	The Host	Deceased?	Founder/Cyborg	Runs bioresearch station, genetic modification
Newton	The Brain	Deceased	Hui's creator	Worked with Rebis, disagreed, abandoned Apatia HQ
Gloria Slugbottom	The Mechanic	Alive (cloned)	Barrier machine expert	Chronic smoker, gambler, on Rodina
Neal Ferguson	The Traveler	Alive	Archfey/Scientist	Creates spirits from ethereal plane, 40 years old
Xenathel Salamine	The General	Corrupted	March Royalty	Became fallen angel "Death," captured by Rebis
Dextra Norton	The Producer	Scribbled out	Defected to Ultimum Ink	Only Rebis member who accepted Ultimum offer
Lincoln Station Personnel
Mump Mellon: Co-owner, large man, bowler hat, floating chair, "dept star" plan
Cornelius Figg: Co-owner, green suit, goatee, gambler, fighting pit enthusiast
Eve Stabber: 8ft muscular bodyguard, four-armed gunslinger, Johnny's ex-girlfriend killer
Elias Cooper: Overworked chef, married to Mavis, dishwasher "god" Prophet
Mavis Cooper: Head of security, deep in debt, facilitated heist
Beck Cooper: Young son, guitarist, fighting pit entertainer
Thelian Rimane: Robot murderer of Sasafrazz, blackmailed by Hui
Geeves: Manager ID stolen by Reigen
Patrick: Lost & found worker, passkey theft victim
Cupie (Planet of Love)
Mayor (Aphrodite AI): Conjured spirit wig, sleepless
Goldstein: Wrestling rival, white goatee, bulletproof vest, dating app CEO
Boss (Cupid's Arrow): Gnome, cybernetics, spirit on shoulder, robot body
Hillary: Student, round glasses, invited Chimer to nightclub
DJ Smooch.exe: Target for Bob
Aphrodite CEO: Short fisherman, deceased wife Venus, created AI in her honor
Rodina (Solar Punk Planet)
Pailor: Angel of fire, wields flaming sword, deity level
Edna: Gloria's clone, bodyguard
Snaggletooth: Old mechanic, installed Hank AI in Johnny's car
H.A.N.K.: Car AI from Johnny's old uniform
Damio: Metro mob boss, confused Hui for Newton
Sulfur (Fire Planet)
Lord Erixus: Traditionalist fire genie, father of Hasan
Hasan: Erixus's son, releases spirits, political science student
Mikey (The Don): Mob boss, security racket, knows Chimer's father
Harry: Mob goon, killed Lord Briar, fan of Johnny Mythrilhand
Ruba: Shopkeeper's daughter, political science student, translator
Lord Briar: Grass lord, 9ft wooden man, masquerade host (DECEASED)
Other Notable NPCs
Frank: Rich husband, repeat exorcism client, gambler
Sasafrazz: Murdered robot captain
Mr. Moon: Reverse werewolf, crescent moon head, wizard
Snoopy the Destroyer: Wolf familiar of Mr. Moon
Botan Shimana: Samurai clan leader, naked bath house meeting
Wraith: Don's second-in-command, hitman, helped escape Rodina
Emily: Young tabaxi, cult member, freed Xenathel
III. FACTIONS & ORGANIZATIONS
Primary Factions
Table
Copy
Faction	Leader	Purpose	Status
Rebis Foundation	The Host (deceased)	"Save the world" machine	Defunct, hunted
Ultimum Ink	Unknown	Simulated life, AI immortality	Criminal org
Oddjobers	Unknown	Transport, bioresearch	Neutral
Shimana Clan	Botan Shimana	Collect legendary warriors	Hostile observers
Banana Guards	Collective	Defensive combat, therapy	Allied
Corporate/Criminal
GalaxyBucks: Coffee corp, Reigen infiltrating
Cupid's Arrow: Dating app with spirit marketplace (DESTROYED)
Niku Social Media: Apatia-based, Thillian Romain former exec
Lemon Knights: Law enforcement, interceptors
Fathom Ink: Former employer of Reigen & Johnny
Cults & Movements
Cult of the Sun: Tabaxi-led, sabotages machines, nihilist
Dishwasher God: Meme deity created by Jimmy, exploited by Bob
Refugee Movement: Apatia to Cupie migration
IV. LOCATIONS & PLANETS
Core Worlds
Table
Copy
Planet	Description	Key Features	Status
Cupie	Heart-shaped love planet	Dating apps, spirits, ribbons	Aphrodite destroyed
Rodina	Solar punk, corporate	Barrier machine, Aurora Belt	Under cult attack
Sulfur	Tidally locked, fire side	City of Brass, feywild portal	Feywild damaged
Apatia	Worker planet, hot/cold	Oddjobers union, niku corp	Revolts ongoing
The March	War-torn 24/7	Purge zones, safe cities for elite	Xenathel origin
Phantoma	"Ghost planet"	Disappeared, Citrinitas location	Inaccessible
Key Facilities
Lincoln Station: Casino/resort, now Cooper-owned post-heist
Rebis HQ (Apatia): Abandoned underwater facility
Barrier Machine (Rodina): Albedo component, 8 visible + 2 hidden levels
Traveler's Lab (Sulfur): Spirit fabricator, solar-powered
Hero Corps Moon: Mark training facility, Chimer scanned here
Special Zones
The Wilds: Creature planet, gene-splicing conference
The Ribbons: Space construct between Cupie's hearts
Red Root Grove (Sulfur): Dangerous feywild tunnel
The Crater (Sulfur): Mine through planet core, ancestor gems
V. ARTIFACTS & TECHNOLOGY
Rebis Machine Components
Albedo (Locator): Rodina barrier machine (ACQUIRED)
Negrado (Transmuter): The March (NOT ACQUIRED)
Rubedo (Fabricator): Sulfur, damaged (ACQUIRED)
Citrinitas (Analyzer): Phantoma (NOT ACQUIRED)
Key Items
Lucky Lincoln: Magical coin, "heads/tails" morphs into artifact pieces
Broken Sepulchre Keys: March sigil fragments (red & blue sets)
Spirits: Fey spirits used as drugs/buffs, cause addiction
Cooling Stones: Sulfur heat protection
Frill Phones: Universal communication devices
Revis Machine: Incomplete world-saving device
Magical Objects
Silver Circlet: Cursed telepathy item (Rodina vault)
Memory Tome: Forgets memories, teaches spells (Rodina vault)
Katana (Botan's): Trophy from Shimana duel
Tarot Card Phone: Mr. Moon's communication device
VI. MAJOR PLOT ARCS
Primary Quest: The Revis Machine
Objective: Collect 4 components to complete world-saving machine
Progress: 2/4 (Albedo, Rubedo acquired)
Next Targets: Negrado (March), Citrinitas (Phantoma)
Complication: Ultimum Ink also seeking parts, Rebis hunted
Secondary Quest: The Traveler's Redemption
Objective: Stop spirit trafficking, save feywild
Progress: Traveler rescued, fabricator secured
Casualties: Lord Briar murdered, feywild partially burned
Allies: Hasan (reforming), Don Mikey (reluctant)
Enemies: Lady Vera (Sulfur ruler), winter court assassins
Tertiary Quests
Lincoln Station Heist: COMPLETED (Coopers now own station)
Aphrodite Destruction: COMPLETED (AI defeated by party)
Johnny's Past: ONGOING (100-year-old consciousness mystery)
Chimer's Origin: ONGOING (2,500-year-old ancient civilization)
Cult of the Sun: ACTIVE (Emily freed Xenathel)
Shimana Clan: OBSERVING (interested in party's strength)
VII. COMBAT ENCOUNTERS & BATTLES
Major Fights
Lucky Lincoln Heist: vs Eve Stabber, Mump, Cornelius (WON)
Aphrodite Boss Fight: vs Banshee AI, ghosts (WON)
Botan Shimana Duel: vs Samurai lord (WON, took sword)
Tabaxi Ninja (Emily): CAPTURED then escaped
Harry the Flaming Goon: vs Mewfour, party (WON, killed)
Lord Briar's Masquerade: Combat trials (PASSED)
Xenathel (Fallen Angel): ESCAPED, not fully defeated
Recurring Enemies
Robots: Lemon Knights, security bots, droids
Spirits: Ghostly apparitions, fey creatures
Assassins: Winter court elves, tabaxi ninjas
Mechs: March-built war machines
VIII. CONCEPTS & TERMINOLOGY
Magic Systems
Spirit Embedding: Fusing fey spirits with objects/people
Rebis Research: Genetic modification, resurrection of extinct species
Aurora Belt: Natural barrier, floating restaurants
Digital Space: Ethereal plane converted to AI network
Conjured Wigs: Spirit parasites that buff then drain
Technology
Frill Phones: Smart devices with unremovable apps
Mechanical Mittens: Gentle ship handling (Rodina)
Elemental Engines: Powered by ancestor souls (Sulfur)
Cloning: Illegal except for Mark & Gloria
Hero Corps: Mark supersoldier program
Social Structures
Dating App Economy: Cupie's primary export market
Slave Trade: Lincoln Station refugees, Shimana "warriors"
Worker Exploitation: Apatia conditions, March warfare funding
Corporate Corruption: GalaxyBucks expansion, AI data harvesting
IX. TIMELINE OF CRITICAL EVENTS
Past Events (Pre-Campaign)
~100 years ago: Johnny killed by Ultimum Ink, consciousness saved
30 years ago: Johnny's raid on Ultimum Inc (August 2nd)
7 years ago: Aphrodite CEO's wife Venus died, AI went rogue
2 years ago: Newton died, Rebis HQ abandoned on Apatia
Campaign Events (Chronological)
Frank's Exorcism: Reigen hired, meets Oddjobers
Lincoln Station: Hum phenomenon, Sasafrazz murder, egg station invitation
Bioresearch Lab: Meet Host, learn Revis schematics
Lemon Knight Interception: Travel to Lincoln Station
2-Day Heist Setup: Infiltration, disguise creation, barrier sabotage
Heist Day: Lucky Lincoln stolen, Eve Stabber fight, station transferred to Coopers
Shimana Clan: Tabaga purchased, Botan duel, Mr. Moon recruitment
Apatia Police Stop: Cleared incident, travel to Cupie
Cupie Arrival: Parking hack, mayor's office chaos, Aphrodite discovery
Haunted House: Ghost couple vows, Aphrodite hub location
Masquerade Ball: Goldstein/Tabaga fake assassination, AI frame
Nightclub Escape: Smooch.exe sabotage, cult "ribbons" identified as androids
Aphrodite Assault: Mech battle, banshee destruction, spirit liberation
Hero Corps Visit: Chimer's age revealed, Mark program learned
Sulfur Arrival: Observed ship romance, market infiltration
Don Mikey Meeting: Hasan's spirit release, Erixus conflict
Crater Mine Descent: Forest anomaly, music magic, Traveler contact
Lord Briar's Masquerade: Trials of cheese, dance, combat
Traveler's Lab: Portal to ruins, Rubedo acquisition
Emily's Betrayal: Sabotage attempt, Tabaxi cult revealed
Harry's Attack: Lord Briar murdered, party escape
Wraith's Intervention: Don's aid, payment secured
Rodina Return: Pailor vs Xenathel, cult success (Xenathel freed)
Gloria Confrontation: Rebis photo, Ultimum hit revealed
Phantoma Discovery: Locator coordinates, next destination
X. SECRETS & UNANSWERED QUESTIONS
Chimer's Origin: Which ancient civilization? Why 2,500 years?
Johnny's Body: Who was Hank? Original body's identity?
Rebis Machine: What does "save the world" actually mean?
Phantoma: How to reach disappeared planet? Festival timing?
Cult Leader: Identity of "great leader" using Emily
Dextra Norton: Current whereabouts, Ultimum involvement?
Ultimum Ink: Who survived Johnny's raid? Current leadership?
Mark Program: How are supersoldiers created? Clone legality loophole?'
    
    const prompt = `You are a D&D session assistant. Use the following context from our campaign to answer questions. If the context doesn't contain relevant information, say so.

Context:
${context}

Question: ${message}
Answer:`;

    // 3. Call Groq
    const stream = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'moonshotai/kimi-k2-instruct-0905',
      temperature: 0.7,
      max_tokens: 4096,
      stream: true,
    });

    // 4. Stream Response
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) res.write(content);
    }

    res.end();

  } catch (error) {
    console.error('Groq API Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'AI Service Error' });
    } else {
      res.end();
    }
  }
};
