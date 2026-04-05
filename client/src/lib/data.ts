// ============================================================
// Quizoi Data Layer
// Design: Arcade Revival — Dark charcoal + electric cyan + coral
// All data is client-side; in production this would be Drizzle + Supabase
// ============================================================

// --- Types ---
export interface Category {
  id: string;
  name: string;
  slug: string;
  emoji: string;
  description: string;
  quizCount: number;
  image?: string;
}

export interface Answer {
  id: string;
  questionId: string;
  text: string;
  isCorrect: boolean;
  votesCount: number;
  order: number;
  imageUrl?: string;  // Optional image for image-style answers
}

export interface Question {
  id: string;
  quizId: string;
  order: number;
  questionText: string;
  mediaType: 'IMAGE' | 'YOUTUBE' | 'VIMEO' | 'NONE';
  mediaUrl: string;
  factLabTitle: string;
  factLabContent: string;
  answers: Answer[];
  answerType?: 'TEXT' | 'IMAGE';  // Whether answers show text or images
  previewImageUrl?: string;       // Optional hint image shown above answers
  showPreviewImage?: boolean;     // Toggle to show/hide the preview image
  adsEnabled?: boolean;           // Show/hide ads on this specific question (default: true)
  showSuggestions?: boolean;      // Show/hide related quiz suggestions on this question (default: true)
  showReveal?: boolean;           // Show the correct/incorrect reveal page after this question (default: true)
}

export interface Quiz {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string;
  categoryId: string;
  status: 'DRAFT' | 'PUBLISHED';
  questionCount: number;
  playCount: number;
  createdAt: string;
  updatedAt: string;
  questions: Question[];
  adsEnabled?: boolean;           // Master ad switch for the entire quiz (default: true)
}

export interface QuizSession {
  id: string;
  quizId: string;
  sessionId: string;
  startedAt: string;
  completedAt: string | null;
  lastQuestion: number;
  score: number | null;
  deviceType: 'desktop' | 'tablet' | 'mobile';
}

// --- Categories ---
export const categories: Category[] = [
  { id: 'cat-1', name: 'Music', slug: 'music', emoji: '🎵', description: 'Test your knowledge of songs, artists, and musical history.', quizCount: 5, image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&q=80' },
  { id: 'cat-2', name: 'Sports', slug: 'sports', emoji: '🏆', description: 'From football to Formula 1, prove you know your sports.', quizCount: 4, image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80' },
  { id: 'cat-3', name: 'Geography', slug: 'geography', emoji: '🌍', description: 'Capitals, countries, and continents — how well do you know the world?', quizCount: 6, image: 'https://d2xsxph8kpxj0f.cloudfront.net/310419663026789360/Hr6WmrsMENHP9hB99engm5/category-geography-GtvqUYBTUx38wkxSQgRbm8.webp' },
  { id: 'cat-4', name: 'History', slug: 'history', emoji: '🏛', description: 'Ancient civilizations to modern events — test your timeline.', quizCount: 3, image: 'https://images.unsplash.com/photo-1604580864964-0462f5d5b1a8?w=600&q=80' },
  { id: 'cat-5', name: 'Science', slug: 'science', emoji: '🔬', description: 'Physics, chemistry, biology — the universe awaits your answers.', quizCount: 5, image: 'https://d2xsxph8kpxj0f.cloudfront.net/310419663026789360/Hr6WmrsMENHP9hB99engm5/category-science-Lnni82kMRinZGHU77zUcX6.webp' },
  { id: 'cat-6', name: 'Movies & TV', slug: 'movies-tv', emoji: '🎬', description: 'Blockbusters, classics, and binge-worthy shows.', quizCount: 7, image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80' },
  { id: 'cat-7', name: 'Maths & Logic', slug: 'maths', emoji: '📐', description: 'Numbers, puzzles, and brain-bending logic problems.', quizCount: 3, image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&q=80' },
  { id: 'cat-8', name: 'Pub Quiz', slug: 'pub-quiz', emoji: '🍺', description: 'Classic pub trivia — general knowledge at its finest.', quizCount: 4, image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&q=80' },
  { id: 'cat-9', name: 'Brain Training', slug: 'brain-training', emoji: '🧠', description: 'Sharpen your mind with memory and cognitive challenges.', quizCount: 2, image: 'https://d2xsxph8kpxj0f.cloudfront.net/310419663026789360/Hr6WmrsMENHP9hB99engm5/quiz-brain-ZRZEdCy7V4ktBmLpt5LdXF.webp' },
  { id: 'cat-10', name: 'Visual Puzzles', slug: 'visual-puzzles', emoji: '👁', description: 'Spot the difference, optical illusions, and visual challenges.', quizCount: 2, image: 'https://images.unsplash.com/photo-1553481187-be93c21490a9?w=600&q=80' },
];

// --- Helper to generate IDs ---
let idCounter = 0;
const uid = () => `id-${++idCounter}`;

// --- Quiz 1: 90s Nostalgia (10 questions) ---
const quiz1Questions: Question[] = [
  {
    id: uid(), quizId: 'quiz-1', order: 1,
    questionText: 'Which boy band released the hit single "I Want It That Way" in 1999?',
    mediaType: 'NONE', mediaUrl: '',
    factLabTitle: 'The Backstreet Boys Phenomenon',
    factLabContent: 'The Backstreet Boys became one of the best-selling boy bands of all time during the late 1990s, with their album "Millennium" selling over 1.13 million copies in its first week in the United States alone. Formed in Orlando, Florida in 1993, the group consisted of AJ McLean, Howie Dorough, Nick Carter, Kevin Richardson, and Brian Littrell. Their manager Lou Pearlman, who also managed NSYNC, played a controversial role in the boy band era. "I Want It That Way" was written by Max Martin and Andreas Carlsson, and despite its somewhat nonsensical lyrics, it became their signature song and was ranked by Rolling Stone as one of the greatest pop songs of all time. The track reached number one in over 25 countries and remains a karaoke staple decades later. The song\'s music video, filmed at an airport, became iconic for its synchronized choreography and emotional delivery.',
    answers: [
      { id: uid(), questionId: '', text: 'NSYNC', isCorrect: false, votesCount: 2847, order: 1 },
      { id: uid(), questionId: '', text: 'Backstreet Boys', isCorrect: true, votesCount: 8432, order: 2 },
      { id: uid(), questionId: '', text: '98 Degrees', isCorrect: false, votesCount: 1203, order: 3 },
      { id: uid(), questionId: '', text: 'Westlife', isCorrect: false, votesCount: 956, order: 4 },
    ],
  },
  {
    id: uid(), quizId: 'quiz-1', order: 2,
    questionText: 'What was the name of the virtual pet toy that became a worldwide craze in 1996?',
    mediaType: 'NONE', mediaUrl: '',
    factLabTitle: 'The Tamagotchi Revolution',
    factLabContent: 'Tamagotchi, created by Bandai and designed by Aki Maita, launched in Japan on November 23, 1996, and quickly became a global phenomenon. The name combines the Japanese word "tamago" meaning egg and the English word "watch." Within the first year, over 40 million units were sold worldwide, causing shortages and even black market sales in some countries. The concept was simple yet revolutionary: a small egg-shaped digital device housed a virtual pet that needed feeding, cleaning, and entertainment. If neglected, the pet would become sick and eventually die, teaching children about responsibility in a digital format. Schools across the world banned them because students were too distracted caring for their virtual pets during class. The original Tamagotchi had only three buttons and a tiny pixelated screen, yet it spawned an entire genre of virtual pet games and inspired countless imitators. Bandai has since released numerous updated versions, including smartphone apps and color-screen models.',
    answers: [
      { id: uid(), questionId: '', text: 'Furby', isCorrect: false, votesCount: 3102, order: 1 },
      { id: uid(), questionId: '', text: 'Giga Pet', isCorrect: false, votesCount: 1456, order: 2 },
      { id: uid(), questionId: '', text: 'Neopets', isCorrect: false, votesCount: 987, order: 3 },
      { id: uid(), questionId: '', text: 'Tamagotchi', isCorrect: true, votesCount: 7893, order: 4 },
    ],
  },
  {
    id: uid(), quizId: 'quiz-1', order: 3,
    questionText: 'Which 1997 film became the highest-grossing movie of all time, holding the record for 12 years?',
    mediaType: 'NONE', mediaUrl: '',
    factLabTitle: 'Titanic\'s Box Office Dominance',
    factLabContent: 'James Cameron\'s "Titanic" was released on December 19, 1997, and went on to gross over $2.2 billion worldwide, a record it held until Cameron\'s own "Avatar" surpassed it in 2010. The film\'s production was famously troubled, with the budget ballooning from an estimated $135 million to over $200 million, making it the most expensive film ever made at that time. Fox executives were so nervous about the cost overruns that they considered pulling the plug multiple times. Leonardo DiCaprio and Kate Winslet starred as Jack and Rose, and their love story set against the backdrop of the doomed ocean liner captivated audiences worldwide. The film won 11 Academy Awards, tying the record held by "Ben-Hur." Celine Dion\'s theme song "My Heart Will Go On" became one of the best-selling singles of all time. Cameron famously declared "I\'m the king of the world!" at the Oscars ceremony, echoing DiCaprio\'s iconic line from the film.',
    answers: [
      { id: uid(), questionId: '', text: 'Jurassic Park', isCorrect: false, votesCount: 1876, order: 1 },
      { id: uid(), questionId: '', text: 'The Lion King', isCorrect: false, votesCount: 1234, order: 2 },
      { id: uid(), questionId: '', text: 'Titanic', isCorrect: true, votesCount: 9012, order: 3 },
      { id: uid(), questionId: '', text: 'Star Wars: The Phantom Menace', isCorrect: false, votesCount: 876, order: 4 },
    ],
  },
  {
    id: uid(), quizId: 'quiz-1', order: 4,
    questionText: 'What was the name of the search engine that dominated the internet before Google took over?',
    mediaType: 'NONE', mediaUrl: '',
    factLabTitle: 'The Rise and Fall of AltaVista',
    factLabContent: 'Before Google became synonymous with internet search, AltaVista was the search engine of choice for millions of users throughout the mid to late 1990s. Launched on December 15, 1995, by Digital Equipment Corporation, AltaVista was revolutionary because it was one of the first search engines to index full text from web pages rather than just titles and headers. At its peak in 1997, AltaVista handled over 80 million search queries per day, an astronomical number for the time. The engine was created by Louis Monier and Michael Burrows at DEC\'s research lab in Palo Alto, California. AltaVista introduced several innovations that we now take for granted, including natural language search queries and the ability to search for images and multimedia content. However, the company made a critical strategic error by trying to transform itself into a portal website similar to Yahoo, cluttering its once-clean interface with news, shopping, and email services. This diluted its core search functionality and opened the door for Google\'s minimalist approach to dominate the market.',
    answers: [
      { id: uid(), questionId: '', text: 'AltaVista', isCorrect: true, votesCount: 5678, order: 1 },
      { id: uid(), questionId: '', text: 'Lycos', isCorrect: false, votesCount: 2345, order: 2 },
      { id: uid(), questionId: '', text: 'Ask Jeeves', isCorrect: false, votesCount: 3456, order: 3 },
      { id: uid(), questionId: '', text: 'Excite', isCorrect: false, votesCount: 1234, order: 4 },
    ],
  },
  {
    id: uid(), quizId: 'quiz-1', order: 5,
    questionText: 'Which TV show featured six friends living in New York City and premiered in 1994?',
    mediaType: 'NONE', mediaUrl: '',
    factLabTitle: 'How Friends Changed Television Forever',
    factLabContent: 'Friends premiered on NBC on September 22, 1994, and ran for 10 seasons until May 6, 2004, becoming one of the most-watched television series in history. Created by David Crane and Marta Kauffman, the show followed the lives of six friends — Ross, Rachel, Monica, Chandler, Joey, and Phoebe — navigating life, love, and careers in Manhattan. The show was originally titled "Insomnia Cafe" before being renamed "Friends Like Us" and then simply "Friends." The iconic Central Perk coffee shop set became so famous that Warner Bros. built a real replica in New York City. By the final season, each of the six main cast members was earning $1 million per episode, making them the highest-paid TV actors at the time. The series finale was watched by 52.5 million American viewers, making it the fourth most-watched series finale in television history. The show\'s cultural impact extended far beyond entertainment, influencing fashion trends, popularizing the "Rachel" haircut, and introducing catchphrases like "How you doin\'?" into everyday language.',
    answers: [
      { id: uid(), questionId: '', text: 'Seinfeld', isCorrect: false, votesCount: 2134, order: 1 },
      { id: uid(), questionId: '', text: 'Friends', isCorrect: true, votesCount: 9876, order: 2 },
      { id: uid(), questionId: '', text: 'Frasier', isCorrect: false, votesCount: 876, order: 3 },
      { id: uid(), questionId: '', text: 'Will & Grace', isCorrect: false, votesCount: 654, order: 4 },
    ],
  },
  {
    id: uid(), quizId: 'quiz-1', order: 6,
    questionText: 'Which gaming console, released in 1994, introduced the world to 3D gaming with titles like Crash Bandicoot?',
    mediaType: 'NONE', mediaUrl: '',
    factLabTitle: 'PlayStation: The Console That Changed Everything',
    factLabContent: 'The original PlayStation, developed by Sony Computer Entertainment, was released in Japan on December 3, 1994, and went on to sell over 102 million units worldwide, fundamentally changing the video game industry. The console\'s origin story is fascinating — it began as a collaboration between Sony and Nintendo to create a CD-ROM add-on for the Super Nintendo. When Nintendo abruptly ended the partnership to work with Philips instead, Sony\'s Ken Kutaragi convinced the company to develop their own standalone console. This decision proved to be one of the most consequential in gaming history. The PlayStation\'s use of CD-ROMs instead of cartridges allowed for much larger games with full-motion video, voice acting, and orchestral soundtracks. Iconic titles like Crash Bandicoot, Final Fantasy VII, Metal Gear Solid, and Resident Evil defined a generation of gamers. The console also shifted gaming\'s demographic, attracting older players with more mature content and sophisticated storytelling. Sony\'s marketing campaign targeted young adults rather than children, positioning gaming as a mainstream entertainment medium rather than just a children\'s hobby.',
    answers: [
      { id: uid(), questionId: '', text: 'Nintendo 64', isCorrect: false, votesCount: 3456, order: 1 },
      { id: uid(), questionId: '', text: 'Sega Saturn', isCorrect: false, votesCount: 1234, order: 2 },
      { id: uid(), questionId: '', text: 'PlayStation', isCorrect: true, votesCount: 7890, order: 3 },
      { id: uid(), questionId: '', text: 'Atari Jaguar', isCorrect: false, votesCount: 567, order: 4 },
    ],
  },
  {
    id: uid(), quizId: 'quiz-1', order: 7,
    questionText: 'What was the name of the cloned sheep that made headlines around the world in 1996?',
    mediaType: 'NONE', mediaUrl: '',
    factLabTitle: 'Dolly the Sheep: A Scientific Milestone',
    factLabContent: 'Dolly the sheep, born on July 5, 1996, at the Roslin Institute in Scotland, became the first mammal to be cloned from an adult somatic cell using the process of nuclear transfer. Named after country music legend Dolly Parton (because the cell used was from a mammary gland), she was created by scientists Ian Wilmut and Keith Campbell. The announcement of her birth on February 22, 1997, sent shockwaves through the scientific community and sparked intense ethical debates about cloning that continue to this day. Dolly was cloned from a cell taken from the mammary gland of a six-year-old Finn Dorset sheep, and it took 277 attempts before a successful embryo was created. She lived her entire life at the Roslin Institute, where she gave birth to several lambs naturally, proving that cloned animals could reproduce. However, Dolly developed arthritis at an unusually young age and was diagnosed with a progressive lung disease, leading to her euthanization on February 14, 2003, at the age of six. Her preserved remains are now displayed at the National Museum of Scotland in Edinburgh.',
    answers: [
      { id: uid(), questionId: '', text: 'Polly', isCorrect: false, votesCount: 1567, order: 1 },
      { id: uid(), questionId: '', text: 'Molly', isCorrect: false, votesCount: 1234, order: 2 },
      { id: uid(), questionId: '', text: 'Holly', isCorrect: false, votesCount: 890, order: 3 },
      { id: uid(), questionId: '', text: 'Dolly', isCorrect: true, votesCount: 8765, order: 4 },
    ],
  },
  {
    id: uid(), quizId: 'quiz-1', order: 8,
    questionText: 'Which Spice Girl was known as "Scary Spice"?',
    mediaType: 'NONE', mediaUrl: '',
    factLabTitle: 'The Spice Girls and Girl Power',
    factLabContent: 'Melanie Brown, better known as Mel B or "Scary Spice," was one of the five members of the Spice Girls, the best-selling female group of all time. The nicknames were actually coined by the British magazine Top of the Pops in 1996, and the group embraced them wholeheartedly. Mel B earned the "Scary" moniker due to her bold personality, wild curly hair, and fearless fashion choices that often included leopard print and platform boots. The Spice Girls formed in 1994 after responding to an advertisement in The Stage magazine seeking girls who were "street smart, extrovert, ambitious, and able to sing and dance." Their debut single "Wannabe" reached number one in 37 countries and became the best-selling single by a female group ever. The group\'s message of "Girl Power" became a cultural phenomenon that empowered a generation of young women. They sold over 100 million records worldwide, starred in the film "Spice World," and even influenced a British general election when they publicly endorsed Tony Blair. Each member\'s distinct personality and style made them individually recognizable, creating a template that would influence pop groups for decades to come.',
    answers: [
      { id: uid(), questionId: '', text: 'Victoria Beckham', isCorrect: false, votesCount: 2345, order: 1 },
      { id: uid(), questionId: '', text: 'Emma Bunton', isCorrect: false, votesCount: 1678, order: 2 },
      { id: uid(), questionId: '', text: 'Melanie Brown', isCorrect: true, votesCount: 7654, order: 3 },
      { id: uid(), questionId: '', text: 'Geri Halliwell', isCorrect: false, votesCount: 1890, order: 4 },
    ],
  },
  {
    id: uid(), quizId: 'quiz-1', order: 9,
    questionText: 'What was the Y2K bug that caused worldwide panic as the year 2000 approached?',
    mediaType: 'NONE', mediaUrl: '',
    factLabTitle: 'The Y2K Scare: Digital Doomsday',
    factLabContent: 'The Y2K bug, also known as the Millennium Bug, was a computer programming problem that threatened to cause widespread chaos as the calendar rolled from December 31, 1999, to January 1, 2000. The issue stemmed from a common practice in early computing where programmers used only two digits to represent the year in dates, meaning "99" for 1999. The fear was that when the date changed to "00," computers would interpret it as 1900 rather than 2000, potentially causing systems to crash or produce incorrect data. Governments and corporations worldwide spent an estimated $300 billion to $600 billion fixing the problem before the deadline. The potential consequences were terrifying: nuclear power plants could malfunction, banking systems could collapse, air traffic control could fail, and military defense systems could go haywire. As midnight approached on New Year\'s Eve 1999, the world held its breath. In the end, the transition was remarkably smooth, leading many to dismiss the threat as overblown. However, experts argue that the massive remediation efforts were precisely why disaster was averted, not because the threat was imaginary.',
    answers: [
      { id: uid(), questionId: '', text: 'A computer virus that spread via email', isCorrect: false, votesCount: 3456, order: 1 },
      { id: uid(), questionId: '', text: 'A date-formatting flaw in computer systems', isCorrect: true, votesCount: 6789, order: 2 },
      { id: uid(), questionId: '', text: 'A hardware defect in Intel processors', isCorrect: false, votesCount: 1234, order: 3 },
      { id: uid(), questionId: '', text: 'A security vulnerability in Windows 98', isCorrect: false, votesCount: 987, order: 4 },
    ],
  },
  {
    id: uid(), quizId: 'quiz-1', order: 10,
    questionText: 'Which 1990s cartoon featured a group of babies on imaginative adventures, led by Tommy Pickles?',
    mediaType: 'NONE', mediaUrl: '',
    factLabTitle: 'Rugrats: The Babies Who Conquered Television',
    factLabContent: 'Rugrats, created by Arlene Klasky, Gábor Csupó, and Paul Germain, premiered on Nickelodeon on August 11, 1991, and ran for nine seasons until 2004, becoming one of the longest-running animated series in television history. The show followed the adventures of a group of toddlers — Tommy Pickles, Chuckie Finster, twins Phil and Lil DeVille, and the bratty Angelica Pickles — as they explored the world from a baby\'s perspective. What made Rugrats special was its dual-layered humor: children enjoyed the slapstick adventures and colorful characters, while adults appreciated the clever wordplay, cultural references, and surprisingly deep emotional storylines. The show spawned two theatrical films, "The Rugrats Movie" in 1998 and "Rugrats in Paris" in 2000, both of which were box office successes. At its peak, Rugrats merchandise generated over $2.5 billion in retail sales annually. The show also broke ground by featuring diverse characters and addressing topics like adoption, immigration, and religious holidays from multiple cultural perspectives. Tommy\'s brave leadership and Chuckie\'s anxious but loyal friendship became templates for character dynamics in children\'s animation for years to come.',
    answers: [
      { id: uid(), questionId: '', text: 'Rugrats', isCorrect: true, votesCount: 8901, order: 1 },
      { id: uid(), questionId: '', text: 'Recess', isCorrect: false, votesCount: 1567, order: 2 },
      { id: uid(), questionId: '', text: 'Hey Arnold!', isCorrect: false, votesCount: 2345, order: 3 },
      { id: uid(), questionId: '', text: 'Dexter\'s Laboratory', isCorrect: false, votesCount: 1234, order: 4 },
    ],
  },
];

// --- Quiz 2: World Geography (10 questions) ---
const quiz2Questions: Question[] = [
  {
    id: uid(), quizId: 'quiz-2', order: 1,
    questionText: 'What is the smallest country in the world by land area?',
    mediaType: 'NONE', mediaUrl: '',
    factLabTitle: 'Vatican City: A Nation Within a City',
    factLabContent: 'Vatican City, officially known as the Vatican City State, is the smallest independent state in the world, covering just 0.44 square kilometers (0.17 square miles) within the city of Rome, Italy. Despite its tiny size, it holds enormous significance as the spiritual and administrative center of the Roman Catholic Church and the residence of the Pope. The state was established on February 11, 1929, through the Lateran Treaty between the Holy See and the Kingdom of Italy, resolving the "Roman Question" that had persisted since Italian unification in 1870. Vatican City has its own postal service, telephone system, banking system, radio station (Vatican Radio), and even its own railway station, though the tracks are only about 300 meters long. The Vatican Museums house one of the world\'s most impressive art collections, including Michelangelo\'s breathtaking ceiling frescoes in the Sistine Chapel. With a population of approximately 800 people, most of whom are clergy or members of the Swiss Guard, Vatican City has the lowest population of any sovereign state. The Swiss Guard, established in 1506, is one of the oldest military units in continuous operation.',
    answers: [
      { id: uid(), questionId: '', text: 'Monaco', isCorrect: false, votesCount: 3456, order: 1 },
      { id: uid(), questionId: '', text: 'San Marino', isCorrect: false, votesCount: 1234, order: 2 },
      { id: uid(), questionId: '', text: 'Vatican City', isCorrect: true, votesCount: 8765, order: 3 },
      { id: uid(), questionId: '', text: 'Liechtenstein', isCorrect: false, votesCount: 987, order: 4 },
    ],
  },
  {
    id: uid(), quizId: 'quiz-2', order: 2,
    questionText: 'Which river is the longest in the world?',
    mediaType: 'NONE', mediaUrl: '',
    factLabTitle: 'The Nile vs. The Amazon: A Heated Debate',
    factLabContent: 'The title of the world\'s longest river has been a subject of ongoing scientific debate between the Nile and the Amazon. Traditionally, the Nile has been recognized as the longest at approximately 6,650 kilometers (4,130 miles), flowing through eleven countries in northeastern Africa from its sources in Burundi and Rwanda to its delta on the Mediterranean Sea in Egypt. However, a 2007 Brazilian expedition claimed to have discovered a new source for the Amazon that would make it longer at approximately 6,992 kilometers (4,345 miles). The measurement of river length is surprisingly complex because it depends on where you define the source and mouth, how you measure the many twists and turns, and whether you follow the main channel or the longest tributary. The Nile has played a crucial role in human civilization for thousands of years, with ancient Egypt developing entirely along its banks. The annual flooding of the Nile deposited rich, fertile soil that made agriculture possible in an otherwise desert landscape. Today, the Aswan High Dam controls these floods and provides hydroelectric power to much of Egypt.',
    answers: [
      { id: uid(), questionId: '', text: 'Amazon', isCorrect: false, votesCount: 4567, order: 1 },
      { id: uid(), questionId: '', text: 'Nile', isCorrect: true, votesCount: 7654, order: 2 },
      { id: uid(), questionId: '', text: 'Yangtze', isCorrect: false, votesCount: 1234, order: 3 },
      { id: uid(), questionId: '', text: 'Mississippi', isCorrect: false, votesCount: 987, order: 4 },
    ],
  },
  {
    id: uid(), quizId: 'quiz-2', order: 3,
    questionText: 'In which country would you find Machu Picchu?',
    mediaType: 'NONE', mediaUrl: '',
    factLabTitle: 'Machu Picchu: The Lost City in the Clouds',
    factLabContent: 'Machu Picchu, the 15th-century Inca citadel perched high in the Andes Mountains of Peru at an elevation of 2,430 meters (7,970 feet), is one of the most iconic archaeological sites in the world. Built during the reign of Inca emperor Pachacuti around 1450 AD, the site was abandoned approximately 100 years later during the Spanish Conquest, though the Spanish never actually discovered it. The citadel remained hidden from the outside world until American historian Hiram Bingham III was led to it by local farmers on July 24, 1911. The site consists of approximately 200 structures, including temples, residences, and agricultural terraces, all built with precisely cut stone blocks fitted together without mortar — a testament to Inca engineering prowess. The famous Intihuatana stone, believed to be an astronomical clock or calendar, demonstrates the Inca\'s sophisticated understanding of astronomy. Machu Picchu was declared a UNESCO World Heritage Site in 1983 and was voted one of the New Seven Wonders of the World in 2007. Today, it attracts over 1.5 million visitors annually, leading to concerns about conservation and the implementation of visitor limits.',
    answers: [
      { id: uid(), questionId: '', text: 'Bolivia', isCorrect: false, votesCount: 2345, order: 1 },
      { id: uid(), questionId: '', text: 'Ecuador', isCorrect: false, votesCount: 1567, order: 2 },
      { id: uid(), questionId: '', text: 'Colombia', isCorrect: false, votesCount: 1234, order: 3 },
      { id: uid(), questionId: '', text: 'Peru', isCorrect: true, votesCount: 8901, order: 4 },
    ],
  },
  {
    id: uid(), quizId: 'quiz-2', order: 4,
    questionText: 'What is the capital city of Australia?',
    mediaType: 'NONE', mediaUrl: '',
    factLabTitle: 'Canberra: The Compromise Capital',
    factLabContent: 'Canberra, the capital of Australia, is a city that exists because of a rivalry between Sydney and Melbourne. When the six Australian colonies federated in 1901 to form the Commonwealth of Australia, both Sydney and Melbourne fiercely competed to become the national capital. The compromise, written into the Australian Constitution, specified that the capital must be in New South Wales but at least 100 miles from Sydney. After years of debate and site inspections, the Canberra site was selected in 1908, and the city was designed from scratch by American architects Walter Burley Griffin and Marion Mahony Griffin, who won an international design competition in 1912. The Griffins\' plan featured geometric patterns centered around a large artificial lake, now named Lake Burley Griffin in their honor. Canberra officially became the capital on March 12, 1913, though Parliament didn\'t move from Melbourne until 1927. Today, Canberra is home to approximately 460,000 people and houses the nation\'s most important institutions, including Parliament House, the High Court, the National Gallery, and the Australian War Memorial. Unlike other Australian cities, Canberra is entirely planned, with wide boulevards, abundant green spaces, and a distinctive circular road layout.',
    answers: [
      { id: uid(), questionId: '', text: 'Sydney', isCorrect: false, votesCount: 5678, order: 1 },
      { id: uid(), questionId: '', text: 'Melbourne', isCorrect: false, votesCount: 3456, order: 2 },
      { id: uid(), questionId: '', text: 'Canberra', isCorrect: true, votesCount: 6789, order: 3 },
      { id: uid(), questionId: '', text: 'Brisbane', isCorrect: false, votesCount: 1234, order: 4 },
    ],
  },
  {
    id: uid(), quizId: 'quiz-2', order: 5,
    questionText: 'Which desert is the largest hot desert in the world?',
    mediaType: 'NONE', mediaUrl: '',
    factLabTitle: 'The Sahara: More Than Just Sand',
    factLabContent: 'The Sahara Desert, covering approximately 9.2 million square kilometers (3.6 million square miles) across North Africa, is the largest hot desert in the world, roughly the size of the United States or China. Contrary to popular belief, the Sahara is not entirely covered in sand dunes — in fact, only about 25% of its surface is sandy. The rest consists of rocky plateaus, gravel plains, dry valleys, and even mountains, with the highest peak being Emi Koussi in Chad at 3,415 meters (11,204 feet). The Sahara spans eleven countries: Algeria, Chad, Egypt, Libya, Mali, Mauritania, Morocco, Niger, Sudan, Tunisia, and Western Sahara. Temperatures can reach a scorching 58°C (136°F) during the day but can drop below freezing at night due to the lack of moisture in the air to retain heat. Remarkably, the Sahara was not always a desert. Archaeological evidence shows that just 5,000 to 11,000 years ago, during the "Green Sahara" period, the region was covered with vegetation, lakes, and rivers, supporting diverse wildlife including hippos, crocodiles, and elephants. Cave paintings found across the Sahara depict swimming humans and lush landscapes.',
    answers: [
      { id: uid(), questionId: '', text: 'Gobi', isCorrect: false, votesCount: 1567, order: 1 },
      { id: uid(), questionId: '', text: 'Arabian', isCorrect: false, votesCount: 2345, order: 2 },
      { id: uid(), questionId: '', text: 'Kalahari', isCorrect: false, votesCount: 987, order: 3 },
      { id: uid(), questionId: '', text: 'Sahara', isCorrect: true, votesCount: 8901, order: 4 },
    ],
  },
  {
    id: uid(), quizId: 'quiz-2', order: 6,
    questionText: 'Which country has the most natural lakes in the world?',
    mediaType: 'NONE', mediaUrl: '',
    factLabTitle: 'Canada: The Land of Lakes',
    factLabContent: 'Canada holds the remarkable distinction of having more natural lakes than all other countries in the world combined. With an estimated 879,800 lakes larger than 10 hectares, Canada contains approximately 60% of all the natural lakes on Earth. This extraordinary abundance is primarily the result of glacial activity during the last Ice Age, which ended approximately 10,000 years ago. As massive glaciers retreated, they carved out depressions in the landscape that filled with meltwater, creating the countless lakes that dot the Canadian Shield and other regions. The Great Lakes, shared with the United States, contain about 21% of the world\'s surface fresh water. Canada\'s largest lake entirely within its borders is Great Bear Lake in the Northwest Territories, covering 31,153 square kilometers. The province of Ontario alone has over 250,000 lakes, while Manitoba is known as the "Land of 100,000 Lakes." These lakes play a vital role in Canada\'s ecosystem, economy, and culture, providing drinking water, hydroelectric power, transportation routes, and recreational opportunities. The abundance of freshwater also makes Canada one of the world\'s most important stewards of this increasingly precious resource.',
    answers: [
      { id: uid(), questionId: '', text: 'Finland', isCorrect: false, votesCount: 3456, order: 1 },
      { id: uid(), questionId: '', text: 'Canada', isCorrect: true, votesCount: 7890, order: 2 },
      { id: uid(), questionId: '', text: 'Russia', isCorrect: false, votesCount: 2345, order: 3 },
      { id: uid(), questionId: '', text: 'Sweden', isCorrect: false, votesCount: 1234, order: 4 },
    ],
  },
  {
    id: uid(), quizId: 'quiz-2', order: 7,
    questionText: 'What is the only continent that spans all four hemispheres?',
    mediaType: 'NONE', mediaUrl: '',
    factLabTitle: 'Africa: The Four-Hemisphere Continent',
    factLabContent: 'Africa is the only continent that lies in all four hemispheres of the Earth — Northern, Southern, Eastern, and Western. This unique geographical position is possible because both the Equator and the Prime Meridian pass through the African continent. The Equator crosses through several African countries including Gabon, Republic of the Congo, Democratic Republic of the Congo, Uganda, Kenya, and Somalia, dividing the continent into its northern and southern portions. The Prime Meridian, the line of zero degrees longitude, passes through Algeria, Mali, Burkina Faso, Togo, and Ghana on its way from the North Pole to the South Pole. Africa is also the second-largest continent by both area and population, covering about 30.3 million square kilometers and home to approximately 1.4 billion people. The continent\'s geography is incredibly diverse, ranging from the Sahara Desert in the north to tropical rainforests in central regions, from the snow-capped peak of Mount Kilimanjaro to the vast savannas of the Serengeti. Africa contains 54 recognized sovereign nations, making it the continent with the most countries, and is home to over 2,000 distinct languages.',
    answers: [
      { id: uid(), questionId: '', text: 'Asia', isCorrect: false, votesCount: 2345, order: 1 },
      { id: uid(), questionId: '', text: 'South America', isCorrect: false, votesCount: 1567, order: 2 },
      { id: uid(), questionId: '', text: 'Africa', isCorrect: true, votesCount: 6789, order: 3 },
      { id: uid(), questionId: '', text: 'Europe', isCorrect: false, votesCount: 1234, order: 4 },
    ],
  },
  {
    id: uid(), quizId: 'quiz-2', order: 8,
    questionText: 'Which Asian country is made up of over 17,000 islands?',
    mediaType: 'NONE', mediaUrl: '',
    factLabTitle: 'Indonesia: The World\'s Largest Archipelago',
    factLabContent: 'Indonesia, officially the Republic of Indonesia, is the world\'s largest archipelago nation, comprising over 17,000 islands spread across more than 5,000 kilometers of ocean between the Indian and Pacific Oceans. Of these islands, approximately 6,000 are inhabited, with the five largest being Sumatra, Java, Borneo (shared with Malaysia and Brunei), Sulawesi, and New Guinea (shared with Papua New Guinea). Java, despite being only the fifth-largest island, is home to over 150 million people, making it the most densely populated island on Earth. Indonesia\'s geographical spread gives it an extraordinary level of biodiversity — it is one of the world\'s 17 "megadiverse" countries, home to 12% of the world\'s mammal species, 16% of reptile and amphibian species, and 17% of bird species. The country straddles the Equator and sits on the Pacific Ring of Fire, giving it more active volcanoes than any other country — approximately 130. This volcanic activity, while dangerous, has created incredibly fertile soil that supports intensive agriculture. Indonesia is the world\'s fourth most populous country with over 275 million people, and it has the largest Muslim population of any country in the world.',
    answers: [
      { id: uid(), questionId: '', text: 'Philippines', isCorrect: false, votesCount: 3456, order: 1 },
      { id: uid(), questionId: '', text: 'Japan', isCorrect: false, votesCount: 2345, order: 2 },
      { id: uid(), questionId: '', text: 'Indonesia', isCorrect: true, votesCount: 7890, order: 3 },
      { id: uid(), questionId: '', text: 'Malaysia', isCorrect: false, votesCount: 1234, order: 4 },
    ],
  },
  {
    id: uid(), quizId: 'quiz-2', order: 9,
    questionText: 'What is the deepest point in the world\'s oceans?',
    mediaType: 'NONE', mediaUrl: '',
    factLabTitle: 'The Mariana Trench: Earth\'s Deepest Abyss',
    factLabContent: 'The Challenger Deep, located in the Mariana Trench in the western Pacific Ocean, is the deepest known point in Earth\'s oceans at approximately 10,935 meters (35,876 feet) below sea level. To put this in perspective, if Mount Everest were placed at the bottom of the Challenger Deep, its peak would still be more than 2,000 meters underwater. The trench itself stretches for about 2,550 kilometers in a crescent shape near the Mariana Islands, east of the Philippines. The extreme depth is created by the process of subduction, where the Pacific tectonic plate is forced beneath the smaller Mariana Plate. The first humans to reach the bottom were Swiss oceanographer Jacques Piccard and U.S. Navy Lieutenant Don Walsh, who descended in the bathyscaphe Trieste on January 23, 1960. It took them nearly five hours to reach the bottom, where they spent only 20 minutes before ascending. In 2012, filmmaker James Cameron made a solo descent in the Deepsea Challenger, becoming only the third person to reach the Challenger Deep. Despite the crushing pressure at the bottom — over 1,000 times atmospheric pressure at sea level — scientists have discovered thriving microbial communities and even small shrimp-like amphipods living in the trench.',
    answers: [
      { id: uid(), questionId: '', text: 'Mariana Trench', isCorrect: true, votesCount: 8901, order: 1 },
      { id: uid(), questionId: '', text: 'Puerto Rico Trench', isCorrect: false, votesCount: 1567, order: 2 },
      { id: uid(), questionId: '', text: 'Java Trench', isCorrect: false, votesCount: 1234, order: 3 },
      { id: uid(), questionId: '', text: 'Tonga Trench', isCorrect: false, votesCount: 987, order: 4 },
    ],
  },
  {
    id: uid(), quizId: 'quiz-2', order: 10,
    questionText: 'Which European country is shaped like a boot?',
    mediaType: 'NONE', mediaUrl: '',
    factLabTitle: 'Italy: The Boot of Europe',
    factLabContent: 'Italy\'s distinctive boot shape is one of the most recognizable geographical outlines in the world, making it easy to identify on any map. The Italian Peninsula extends into the Mediterranean Sea from southern Europe, with the "toe" of the boot pointing toward the island of Sicily, separated by the narrow Strait of Messina. The "heel" forms the Salento Peninsula in the Puglia region, while the "shin" runs along the Tyrrhenian Sea coast. This unique shape is the result of millions of years of tectonic activity, as the African and Eurasian plates collided and continue to push against each other. Italy\'s geography has profoundly influenced its history and culture. The Apennine Mountains run down the center of the peninsula like a spine, historically dividing the country into distinct regions with their own dialects, cuisines, and traditions. The country is bordered by four seas: the Adriatic to the east, the Ionian to the southeast, the Tyrrhenian to the west, and the Ligurian to the northwest. Italy also contains two independent micro-states within its borders: Vatican City and San Marino. The country\'s 7,600 kilometers of coastline, combined with its Mediterranean climate, make it one of the world\'s most popular tourist destinations, attracting over 60 million visitors annually.',
    answers: [
      { id: uid(), questionId: '', text: 'Greece', isCorrect: false, votesCount: 1234, order: 1 },
      { id: uid(), questionId: '', text: 'Spain', isCorrect: false, votesCount: 876, order: 2 },
      { id: uid(), questionId: '', text: 'Italy', isCorrect: true, votesCount: 9876, order: 3 },
      { id: uid(), questionId: '', text: 'Portugal', isCorrect: false, votesCount: 567, order: 4 },
    ],
  },
];

// --- Quiz 3: Science & Nature (10 questions) ---
const quiz3Questions: Question[] = [
  {
    id: uid(), quizId: 'quiz-3', order: 1,
    questionText: 'What is the hardest natural substance on Earth?',
    mediaType: 'NONE', mediaUrl: '',
    factLabTitle: 'Diamond: Nature\'s Ultimate Material',
    factLabContent: 'Diamond, composed entirely of carbon atoms arranged in a crystal structure called diamond cubic, is the hardest known natural material on Earth, scoring a perfect 10 on the Mohs scale of mineral hardness. This extraordinary hardness results from each carbon atom being covalently bonded to four other carbon atoms in a three-dimensional tetrahedral lattice, creating an incredibly rigid and stable structure. Diamonds form deep within the Earth\'s mantle, approximately 150 to 200 kilometers below the surface, under extreme conditions of temperature (around 1,000 to 1,300°C) and pressure (approximately 50,000 atmospheres). They are brought to the surface through violent volcanic eruptions that create narrow pipes of a rock called kimberlite. Most natural diamonds are between 1 billion and 3.5 billion years old, meaning they formed when the Earth was still relatively young. Beyond their use in jewelry, diamonds have numerous industrial applications due to their hardness, thermal conductivity, and optical properties. They are used in cutting, grinding, and drilling tools, as well as in high-performance electronics and scientific instruments. Interestingly, while diamond is the hardest natural substance, it is not the strongest — it is actually quite brittle and can be shattered with a hammer.',
    answers: [
      { id: uid(), questionId: '', text: 'Quartz', isCorrect: false, votesCount: 1567, order: 1 },
      { id: uid(), questionId: '', text: 'Diamond', isCorrect: true, votesCount: 8901, order: 2 },
      { id: uid(), questionId: '', text: 'Titanium', isCorrect: false, votesCount: 2345, order: 3 },
      { id: uid(), questionId: '', text: 'Obsidian', isCorrect: false, votesCount: 1234, order: 4 },
    ],
  },
  {
    id: uid(), quizId: 'quiz-3', order: 2,
    questionText: 'How many bones does an adult human body have?',
    mediaType: 'NONE', mediaUrl: '',
    factLabTitle: 'The Human Skeleton: A Living Framework',
    factLabContent: 'An adult human body contains 206 bones, though this number can vary slightly between individuals due to anatomical variations. Interestingly, babies are born with approximately 270 to 300 bones, many of which are made of soft, flexible cartilage that gradually hardens and fuses together as the child grows. This process, called ossification, continues until about age 25, when the skeleton reaches its final form. The smallest bone in the human body is the stapes (stirrup) in the middle ear, measuring just 2.5 to 3.3 millimeters in length, while the largest is the femur (thighbone), which can be up to 50 centimeters long. The human skeleton serves multiple critical functions beyond structural support: it protects vital organs, produces blood cells in the bone marrow, stores minerals like calcium and phosphorus, and enables movement through its joints and attachment points for muscles. Bones are living tissue that constantly remodels itself — the entire skeleton is replaced approximately every 10 years through a process of bone resorption and formation. Weight-bearing exercise stimulates bone formation, which is why astronauts who spend extended periods in microgravity can lose up to 1-2% of their bone mass per month.',
    answers: [
      { id: uid(), questionId: '', text: '186', isCorrect: false, votesCount: 1234, order: 1 },
      { id: uid(), questionId: '', text: '206', isCorrect: true, votesCount: 7890, order: 2 },
      { id: uid(), questionId: '', text: '226', isCorrect: false, votesCount: 2345, order: 3 },
      { id: uid(), questionId: '', text: '256', isCorrect: false, votesCount: 1567, order: 4 },
    ],
  },
  {
    id: uid(), quizId: 'quiz-3', order: 3,
    questionText: 'What planet in our solar system has the most moons?',
    mediaType: 'NONE', mediaUrl: '',
    factLabTitle: 'Saturn\'s Moon Collection Keeps Growing',
    factLabContent: 'Saturn currently holds the record for the most known moons in our solar system, with over 140 confirmed natural satellites as of recent discoveries. This surpassed Jupiter\'s count, which had long been considered the moon champion. The discovery of dozens of new small, irregular moons around Saturn was made possible by advanced ground-based telescopes and careful analysis of orbital data. Saturn\'s most famous moon, Titan, is the second-largest moon in the solar system and the only moon known to have a dense atmosphere and stable bodies of surface liquid — though these lakes and seas are filled with liquid methane and ethane rather than water. Enceladus, another of Saturn\'s moons, has become one of the most exciting targets in the search for extraterrestrial life after the Cassini spacecraft discovered geysers of water vapor erupting from its south pole, suggesting a subsurface ocean beneath its icy crust. Saturn\'s moons range enormously in size, from Titan at 5,150 kilometers in diameter to tiny moonlets just a few hundred meters across that orbit within the planet\'s famous ring system. Many of Saturn\'s smaller moons are thought to be captured asteroids or fragments from collisions between larger moons.',
    answers: [
      { id: uid(), questionId: '', text: 'Jupiter', isCorrect: false, votesCount: 4567, order: 1 },
      { id: uid(), questionId: '', text: 'Saturn', isCorrect: true, votesCount: 6789, order: 2 },
      { id: uid(), questionId: '', text: 'Uranus', isCorrect: false, votesCount: 1234, order: 3 },
      { id: uid(), questionId: '', text: 'Neptune', isCorrect: false, votesCount: 987, order: 4 },
    ],
  },
  {
    id: uid(), quizId: 'quiz-3', order: 4,
    questionText: 'What gas do plants absorb from the atmosphere during photosynthesis?',
    mediaType: 'NONE', mediaUrl: '',
    factLabTitle: 'Photosynthesis: The Engine of Life on Earth',
    factLabContent: 'Plants absorb carbon dioxide from the atmosphere during photosynthesis, a process that is fundamental to virtually all life on Earth. During photosynthesis, plants use energy from sunlight to convert carbon dioxide and water into glucose (a sugar used for energy) and oxygen, which is released as a byproduct. This process takes place primarily in the chloroplasts of plant cells, which contain the green pigment chlorophyll that gives plants their characteristic color. Chlorophyll absorbs red and blue light most efficiently while reflecting green light, which is why plants appear green to our eyes. The chemical equation for photosynthesis is elegantly simple: 6CO2 + 6H2O + light energy → C6H12O6 + 6O2. However, the actual biochemical process involves hundreds of complex chemical reactions organized into two main stages: the light-dependent reactions (which occur in the thylakoid membranes) and the Calvin cycle (which occurs in the stroma). Plants are responsible for producing approximately 50% of the oxygen in Earth\'s atmosphere, with the other half produced by marine organisms like phytoplankton and cyanobacteria. A single large tree can absorb approximately 22 kilograms of carbon dioxide per year and produce enough oxygen for two people to breathe.',
    answers: [
      { id: uid(), questionId: '', text: 'Oxygen', isCorrect: false, votesCount: 2345, order: 1 },
      { id: uid(), questionId: '', text: 'Nitrogen', isCorrect: false, votesCount: 1234, order: 2 },
      { id: uid(), questionId: '', text: 'Carbon Dioxide', isCorrect: true, votesCount: 8901, order: 3 },
      { id: uid(), questionId: '', text: 'Hydrogen', isCorrect: false, votesCount: 987, order: 4 },
    ],
  },
  {
    id: uid(), quizId: 'quiz-3', order: 5,
    questionText: 'What is the speed of light in a vacuum, approximately?',
    mediaType: 'NONE', mediaUrl: '',
    factLabTitle: 'The Speed of Light: The Universe\'s Speed Limit',
    factLabContent: 'The speed of light in a vacuum is approximately 299,792,458 meters per second, or roughly 300,000 kilometers per second (186,000 miles per second). This speed, denoted by the letter "c" in physics equations, is considered the ultimate speed limit of the universe according to Einstein\'s theory of special relativity. Nothing with mass can reach or exceed this speed because doing so would require infinite energy. Light travels so fast that it can circle the Earth approximately 7.5 times in just one second. However, even at this incredible speed, the vast distances of space mean that light from the Sun takes about 8 minutes and 20 seconds to reach Earth, and light from the nearest star system, Alpha Centauri, takes over 4 years to reach us. The speed of light was first measured with reasonable accuracy by Danish astronomer Ole Rømer in 1676, who noticed that the timing of eclipses of Jupiter\'s moons varied depending on Earth\'s distance from Jupiter. Albert Einstein\'s famous equation E=mc² shows that energy and mass are interchangeable, with the speed of light squared serving as the conversion factor — explaining why even small amounts of matter contain enormous amounts of energy.',
    answers: [
      { id: uid(), questionId: '', text: '150,000 km/s', isCorrect: false, votesCount: 1567, order: 1 },
      { id: uid(), questionId: '', text: '300,000 km/s', isCorrect: true, votesCount: 7890, order: 2 },
      { id: uid(), questionId: '', text: '500,000 km/s', isCorrect: false, votesCount: 1234, order: 3 },
      { id: uid(), questionId: '', text: '1,000,000 km/s', isCorrect: false, votesCount: 987, order: 4 },
    ],
  },
  {
    id: uid(), quizId: 'quiz-3', order: 6,
    questionText: 'Which element has the chemical symbol "Au"?',
    mediaType: 'NONE', mediaUrl: '',
    factLabTitle: 'Gold: The Element That Built Civilizations',
    factLabContent: 'Gold, with the chemical symbol Au (from the Latin "aurum" meaning "shining dawn"), is element number 79 on the periodic table. It is one of the few elements that occurs naturally in its pure, metallic form, which is why it was one of the first metals discovered and used by humans, with artifacts dating back over 6,000 years. Gold\'s distinctive yellow color is actually the result of relativistic effects on its electrons — the inner electrons orbit so fast (about 58% the speed of light) that relativistic mass increase causes them to absorb blue light, giving gold its warm yellow appearance. Without these relativistic effects, gold would appear silvery-white like most other metals. Gold is extraordinarily malleable and ductile: a single ounce can be beaten into a sheet covering 9 square meters, or drawn into a wire 80 kilometers long. It is also an excellent conductor of electricity and is highly resistant to corrosion, which is why it is used in electronics, aerospace technology, and medical devices. All the gold ever mined in human history would fit into approximately three Olympic swimming pools. Gold is thought to have been created in neutron star collisions and supernova explosions, meaning every gold atom on Earth was forged in cosmic cataclysms billions of years ago.',
    answers: [
      { id: uid(), questionId: '', text: 'Silver', isCorrect: false, votesCount: 1234, order: 1 },
      { id: uid(), questionId: '', text: 'Gold', isCorrect: true, votesCount: 8765, order: 2 },
      { id: uid(), questionId: '', text: 'Copper', isCorrect: false, votesCount: 1567, order: 3 },
      { id: uid(), questionId: '', text: 'Aluminum', isCorrect: false, votesCount: 987, order: 4 },
    ],
  },
  {
    id: uid(), quizId: 'quiz-3', order: 7,
    questionText: 'What is the largest organ in the human body?',
    mediaType: 'NONE', mediaUrl: '',
    factLabTitle: 'Skin: The Body\'s Remarkable Shield',
    factLabContent: 'The skin is the largest organ in the human body, covering an average area of about 1.7 to 2 square meters (18 to 22 square feet) in adults and weighing approximately 3.6 kilograms (8 pounds), accounting for about 16% of total body weight. Despite being only 2 to 3 millimeters thick on average, the skin performs an astonishing array of vital functions. It serves as a waterproof barrier protecting internal organs from the external environment, regulates body temperature through sweating and blood vessel dilation, synthesizes vitamin D when exposed to ultraviolet light, and houses an extensive network of nerve endings that provide our sense of touch, pressure, temperature, and pain. The skin consists of three main layers: the epidermis (outer layer), the dermis (middle layer containing blood vessels, nerves, and hair follicles), and the hypodermis (deepest layer of fat and connective tissue). The epidermis completely renews itself approximately every 27 days, meaning you get an entirely new outer layer of skin roughly 13 times per year. Humans shed approximately 30,000 to 40,000 dead skin cells every hour, which amounts to about 1.5 pounds of skin per year. Much of the dust in your home is actually composed of these shed skin cells.',
    answers: [
      { id: uid(), questionId: '', text: 'Liver', isCorrect: false, votesCount: 3456, order: 1 },
      { id: uid(), questionId: '', text: 'Lungs', isCorrect: false, votesCount: 1234, order: 2 },
      { id: uid(), questionId: '', text: 'Intestines', isCorrect: false, votesCount: 2345, order: 3 },
      { id: uid(), questionId: '', text: 'Skin', isCorrect: true, votesCount: 7890, order: 4 },
    ],
  },
  {
    id: uid(), quizId: 'quiz-3', order: 8,
    questionText: 'What is the chemical formula for water?',
    mediaType: 'NONE', mediaUrl: '',
    factLabTitle: 'Water: The Molecule That Makes Life Possible',
    factLabContent: 'Water, with the chemical formula H2O, is arguably the most important molecule on Earth and is essential for all known forms of life. Each water molecule consists of two hydrogen atoms covalently bonded to one oxygen atom at an angle of approximately 104.5 degrees, creating a bent molecular shape that gives water many of its unique and remarkable properties. Water is one of the very few substances that is less dense as a solid than as a liquid, which is why ice floats. This seemingly simple property is actually crucial for life on Earth — if ice sank, lakes and oceans would freeze from the bottom up, killing aquatic life and dramatically altering the planet\'s climate. Water has an unusually high specific heat capacity, meaning it can absorb and release large amounts of heat without significant temperature changes, which helps regulate Earth\'s climate and body temperature. Water is also an excellent solvent, earning it the nickname "the universal solvent," because its polar nature allows it to dissolve more substances than any other liquid. The human body is approximately 60% water by weight, and even a 2% decrease in hydration can significantly impair cognitive and physical performance.',
    answers: [
      { id: uid(), questionId: '', text: 'H2O', isCorrect: true, votesCount: 9876, order: 1 },
      { id: uid(), questionId: '', text: 'CO2', isCorrect: false, votesCount: 876, order: 2 },
      { id: uid(), questionId: '', text: 'NaCl', isCorrect: false, votesCount: 567, order: 3 },
      { id: uid(), questionId: '', text: 'O2', isCorrect: false, votesCount: 1234, order: 4 },
    ],
  },
  {
    id: uid(), quizId: 'quiz-3', order: 9,
    questionText: 'Which animal can sleep for up to 22 hours a day?',
    mediaType: 'NONE', mediaUrl: '',
    factLabTitle: 'The Koala: Nature\'s Champion Sleeper',
    factLabContent: 'Koalas are among the sleepiest animals on the planet, sleeping an average of 18 to 22 hours per day. This extraordinary amount of sleep is directly related to their diet of eucalyptus leaves, which are extremely low in nutrition and high in toxic compounds called tannins and phenols. Digesting these tough, fibrous leaves requires enormous amounts of energy, and the koala\'s slow metabolic rate — similar to that of a sloth — is an evolutionary adaptation to extract maximum nutrition from minimal food. Koalas have a specialized digestive organ called a caecum, which can be up to 2 meters long and contains bacteria that help break down the tough eucalyptus fibers. Despite having access to over 700 species of eucalyptus, koalas are extremely picky eaters and will only consume about 50 species, with strong preferences for specific trees. Koalas are not actually bears, despite being commonly called "koala bears" — they are marsupials, more closely related to wombats and kangaroos. Baby koalas, called joeys, are born after just 35 days of gestation, measuring only about 2 centimeters long, and spend the next six months developing in their mother\'s pouch. Koalas have fingerprints that are remarkably similar to human fingerprints, so similar that they have occasionally confused forensic investigators at crime scenes.',
    answers: [
      { id: uid(), questionId: '', text: 'Sloth', isCorrect: false, votesCount: 4567, order: 1 },
      { id: uid(), questionId: '', text: 'Cat', isCorrect: false, votesCount: 2345, order: 2 },
      { id: uid(), questionId: '', text: 'Koala', isCorrect: true, votesCount: 6789, order: 3 },
      { id: uid(), questionId: '', text: 'Panda', isCorrect: false, votesCount: 1234, order: 4 },
    ],
  },
  {
    id: uid(), quizId: 'quiz-3', order: 10,
    questionText: 'What is the most abundant gas in Earth\'s atmosphere?',
    mediaType: 'NONE', mediaUrl: '',
    factLabTitle: 'Nitrogen: The Invisible Majority',
    factLabContent: 'Nitrogen makes up approximately 78.09% of Earth\'s atmosphere by volume, making it by far the most abundant gas in the air we breathe. Despite being all around us and essential for life, nitrogen in its atmospheric form (N2) is remarkably inert and unreactive due to the extremely strong triple bond between its two atoms. This triple bond requires enormous energy to break — about 945 kilojoules per mole — which is why atmospheric nitrogen cannot be directly used by most living organisms. The process of converting atmospheric nitrogen into biologically usable forms is called nitrogen fixation, and it is performed by specialized bacteria, either free-living in the soil or in symbiotic relationships with the roots of leguminous plants like beans, peas, and clover. Lightning also fixes a small amount of nitrogen by providing enough energy to break the triple bond. The industrial Haber-Bosch process, developed in the early 20th century, artificially fixes nitrogen to produce ammonia for fertilizers and is considered one of the most important inventions in human history — it is estimated that approximately half of the nitrogen atoms in your body were fixed through this industrial process. Without the Haber-Bosch process, the world could only support about 3 to 4 billion people, roughly half the current population.',
    answers: [
      { id: uid(), questionId: '', text: 'Oxygen', isCorrect: false, votesCount: 3456, order: 1 },
      { id: uid(), questionId: '', text: 'Carbon Dioxide', isCorrect: false, votesCount: 1234, order: 2 },
      { id: uid(), questionId: '', text: 'Hydrogen', isCorrect: false, votesCount: 987, order: 3 },
      { id: uid(), questionId: '', text: 'Nitrogen', isCorrect: true, votesCount: 7890, order: 4 },
    ],
  },
];

// --- Quizzes ---
export const quizzes: Quiz[] = [
  {
    id: 'quiz-1',
    title: "Only 90s Kids Will Score 10/10 On This Ultimate Decade Quiz",
    slug: '90s-ultimate-quiz',
    description: 'Think you remember the 90s? From Tamagotchis to Titanic, test your knowledge of the greatest decade ever.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1533488765986-dfa2a9939acd?w=600&q=80',
    categoryId: 'cat-8',
    status: 'PUBLISHED',
    questionCount: 10,
    playCount: 13438,
    createdAt: '2026-03-20T10:00:00Z',
    updatedAt: '2026-03-20T10:00:00Z',
    questions: quiz1Questions,
  },
  {
    id: 'quiz-2',
    title: "Can You Score 10/10 On This World Geography Quiz?",
    slug: 'world-geography-quiz',
    description: 'Capitals, continents, and countries — how well do you really know our planet? Most adults fail this quiz.',
    thumbnailUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/310419663026789360/Hr6WmrsMENHP9hB99engm5/category-geography-GtvqUYBTUx38wkxSQgRbm8.webp',
    categoryId: 'cat-3',
    status: 'PUBLISHED',
    questionCount: 10,
    playCount: 9876,
    createdAt: '2026-03-18T14:00:00Z',
    updatedAt: '2026-03-18T14:00:00Z',
    questions: quiz2Questions,
  },
  {
    id: 'quiz-3',
    title: "The Science Quiz That's Stumping Everyone",
    slug: 'science-stumper-quiz',
    description: 'From the speed of light to the human body — only true science lovers can ace this challenging quiz.',
    thumbnailUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/310419663026789360/Hr6WmrsMENHP9hB99engm5/category-science-Lnni82kMRinZGHU77zUcX6.webp',
    categoryId: 'cat-5',
    status: 'PUBLISHED',
    questionCount: 10,
    playCount: 7654,
    createdAt: '2026-03-15T09:00:00Z',
    updatedAt: '2026-03-15T09:00:00Z',
    questions: quiz3Questions,
  },
];

// --- Utility Functions ---
export function getQuizBySlug(slug: string): Quiz | undefined {
  // First check admin store for overrides, then fall back to seed data
  return quizzes.find(q => q.slug === slug);
}

/**
 * Returns related quizzes for a given quiz:
 * - Section 1: Up to 3 quizzes from the SAME category (excluding current)
 * - Section 2: Up to 3 quizzes from DIFFERENT categories (random selection)
 */
export function getRelatedQuizzes(currentQuizId: string, categoryId: string): {
  sameCategory: Quiz[];
  otherCategories: Quiz[];
} {
  const published = quizzes.filter(q => q.status === 'PUBLISHED' && q.id !== currentQuizId);
  const sameCategory = published.filter(q => q.categoryId === categoryId).slice(0, 3);
  const otherCategories = published
    .filter(q => q.categoryId !== categoryId)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  return { sameCategory, otherCategories };
}

export function getQuizzesByCategory(categorySlug: string): Quiz[] {
  const category = categories.find(c => c.slug === categorySlug);
  if (!category) return [];
  return quizzes.filter(q => q.categoryId === category.id && q.status === 'PUBLISHED');
}

export function getCategoryById(id: string): Category | undefined {
  return categories.find(c => c.id === id);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find(c => c.slug === slug);
}

export function getQuestion(quiz: Quiz, order: number): Question | undefined {
  return quiz.questions.find(q => q.order === order);
}

export function getTotalVotes(answers: Answer[]): number {
  return answers.reduce((sum, a) => sum + a.votesCount, 0);
}

export function getVotePercentage(answer: Answer, totalVotes: number): number {
  if (totalVotes === 0) return 0;
  return Math.round((answer.votesCount / totalVotes) * 100);
}

export function formatPlayCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

export function getScoreMessage(score: number, total: number): { title: string; description: string; emoji: string } {
  const pct = (score / total) * 100;
  if (pct === 100) return { title: 'PERFECT SCORE!', description: 'You are an absolute genius! Not many people can say they got every single question right.', emoji: '🏆' };
  if (pct >= 80) return { title: 'Impressive!', description: 'You really know your stuff! Just a couple of tricky ones caught you out.', emoji: '🌟' };
  if (pct >= 60) return { title: 'Not Bad!', description: 'You\'ve got solid knowledge, but there\'s room to learn more. Try again?', emoji: '👍' };
  if (pct >= 40) return { title: 'Keep Trying!', description: 'You got some right, but this quiz clearly has some tough questions for you.', emoji: '🤔' };
  return { title: 'Better Luck Next Time!', description: 'This was a tough one! Why not read the fact labs and try again?', emoji: '📚' };
}

// Session storage helpers for quiz state
const STORAGE_PREFIX = 'quizoi_';

export function saveQuizAnswer(quizSlug: string, questionOrder: number, answerId: string, isCorrect: boolean) {
  const key = `${STORAGE_PREFIX}${quizSlug}`;
  const existing = JSON.parse(sessionStorage.getItem(key) || '{}');
  existing[questionOrder] = { answerId, isCorrect };
  sessionStorage.setItem(key, JSON.stringify(existing));
}

export function getQuizAnswer(quizSlug: string, questionOrder: number): { answerId: string; isCorrect: boolean } | null {
  const key = `${STORAGE_PREFIX}${quizSlug}`;
  const existing = JSON.parse(sessionStorage.getItem(key) || '{}');
  return existing[questionOrder] || null;
}

export function getQuizScore(quizSlug: string, totalQuestions: number): number {
  const key = `${STORAGE_PREFIX}${quizSlug}`;
  const existing = JSON.parse(sessionStorage.getItem(key) || '{}');
  let score = 0;
  for (let i = 1; i <= totalQuestions; i++) {
    if (existing[i]?.isCorrect) score++;
  }
  return score;
}

export function clearQuizSession(quizSlug: string) {
  sessionStorage.removeItem(`${STORAGE_PREFIX}${quizSlug}`);
}
