// ============================================================
// db/seed.ts — Quizoi Database Seed Script
// Migrates all existing localStorage/static data into Supabase.
//
// Usage:
//   npx tsx db/seed.ts
//   (or add to package.json: "db:seed": "tsx db/seed.ts")
//
// IMPORTANT: Run AFTER applying migrations (pnpm drizzle-kit migrate)
// ============================================================

import 'dotenv/config';
import { db } from './client';
import {
  categories,
  quizzes,
  questions,
  answers,
  siteSettings,
} from './schema';
import { sql } from 'drizzle-orm';

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_CATEGORIES = [
  {
    name: 'Music',
    slug: 'music',
    emoji: '🎵',
    description: 'Test your knowledge of songs, artists, and musical history.',
    imageUrl:
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&q=80',
  },
  {
    name: 'Sports',
    slug: 'sports',
    emoji: '🏆',
    description: 'From football to Formula 1, prove you know your sports.',
    imageUrl:
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80',
  },
  {
    name: 'Geography',
    slug: 'geography',
    emoji: '🌍',
    description:
      'Capitals, countries, and continents — how well do you know the world?',
    imageUrl:
      'https://d2xsxph8kpxj0f.cloudfront.net/310419663026789360/Hr6WmrsMENHP9hB99engm5/category-geography-GtvqUYBTUx38wkxSQgRbm8.webp',
  },
  {
    name: 'History',
    slug: 'history',
    emoji: '🏛',
    description:
      'Ancient civilizations to modern events — test your timeline.',
    imageUrl:
      'https://images.unsplash.com/photo-1604580864964-0462f5d5b1a8?w=600&q=80',
  },
  {
    name: 'Science',
    slug: 'science',
    emoji: '🔬',
    description:
      'Physics, chemistry, biology — the universe awaits your answers.',
    imageUrl:
      'https://d2xsxph8kpxj0f.cloudfront.net/310419663026789360/Hr6WmrsMENHP9hB99engm5/category-science-Lnni82kMRinZGHU77zUcX6.webp',
  },
  {
    name: 'Movies & TV',
    slug: 'movies-tv',
    emoji: '🎬',
    description: 'Blockbusters, classics, and binge-worthy shows.',
    imageUrl:
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80',
  },
  {
    name: 'Maths & Logic',
    slug: 'maths',
    emoji: '📐',
    description: 'Numbers, patterns, and puzzles for the analytical mind.',
    imageUrl:
      'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&q=80',
  },
  {
    name: 'Pub Quiz',
    slug: 'pub-quiz',
    emoji: '🍺',
    description: 'Classic pub quiz rounds — general knowledge at its finest.',
    imageUrl:
      'https://images.unsplash.com/photo-1575037614876-c38a4d44f5b8?w=600&q=80',
  },
  {
    name: 'Brain Training',
    slug: 'brain-training',
    emoji: '🧠',
    description: 'Sharpen your mind with cognitive challenges.',
    imageUrl:
      'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=600&q=80',
  },
  {
    name: 'Visual Puzzles',
    slug: 'visual-puzzles',
    emoji: '👁',
    description: 'Can you spot the difference? Optical illusions and more.',
    imageUrl:
      'https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?w=600&q=80',
  },
];

// ─── Main Seed Function ───────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Starting Quizoi database seed...\n');

  // ── 1. Truncate existing data (safe for fresh installs) ──────────────────
  console.log('🗑  Clearing existing data...');
  await db.execute(sql`TRUNCATE TABLE answers, questions, quiz_sessions, quizzes, categories, site_settings RESTART IDENTITY CASCADE`);
  console.log('   ✓ Tables cleared\n');

  // ── 2. Insert categories ─────────────────────────────────────────────────
  console.log('📂 Inserting categories...');
  const insertedCategories = await db
    .insert(categories)
    .values(SEED_CATEGORIES)
    .returning();
  console.log(`   ✓ ${insertedCategories.length} categories inserted\n`);

  // Build a slug → id map for use when inserting quizzes
  const categoryMap = Object.fromEntries(
    insertedCategories.map((c) => [c.slug, c.id]),
  );

  // ── 3. Insert sample quiz ────────────────────────────────────────────────
  console.log('📝 Inserting sample quiz (90s Nostalgia)...');

  const [sampleQuiz] = await db
    .insert(quizzes)
    .values({
      title: "Only 90s Kids Will Score 10/10 On This Ultimate Decade Quiz",
      slug: '90s-nostalgia-quiz',
      description:
        'Think you remember the 90s? From Tamagotchis to the Spice Girls — put your decade knowledge to the ultimate test.',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
      categoryId: categoryMap['music'] ?? insertedCategories[0].id,
      status: 'PUBLISHED',
      adsEnabled: true,
    })
    .returning();

  console.log(`   ✓ Quiz created: "${sampleQuiz.title}"\n`);

  // ── 4. Insert sample questions ───────────────────────────────────────────
  console.log('❓ Inserting questions...');

  const SAMPLE_QUESTIONS = [
    {
      order: 1,
      questionText: 'Which console was released by Sony in 1994, revolutionising the gaming industry?',
      mediaType: 'NONE' as const,
      mediaUrl: '',
      factLabTitle: 'The Birth of the PlayStation',
      factLabContent:
        "Sony's entry into the gaming market in 1994 with the PlayStation was one of the most consequential moments in entertainment history. Originally, Sony had been working with Nintendo to develop a CD-ROM add-on for the Super Nintendo, but a falling-out over licensing terms led Sony to develop their own standalone console. The PlayStation used CD-ROMs instead of cartridges, allowing for much larger games with full-motion video, voice acting, and orchestral soundtracks. This shift fundamentally changed what games could be. Iconic titles like Crash Bandicoot, Final Fantasy VII, Metal Gear Solid, and Resident Evil defined a generation of gamers. The console also shifted gaming's demographic, attracting older players with more mature content and sophisticated storytelling. Sony's marketing campaign targeted young adults rather than children, positioning gaming as a mainstream entertainment medium. By the time the PlayStation was discontinued, it had sold over 102 million units worldwide, making it the first console to ever reach that milestone.",
      answerType: 'TEXT' as const,
    },
    {
      order: 2,
      questionText: 'What was the name of the cloned sheep that made headlines around the world in 1996?',
      mediaType: 'NONE' as const,
      mediaUrl: '',
      factLabTitle: 'Dolly the Sheep: A Scientific Milestone',
      factLabContent:
        "Dolly the sheep, born on July 5, 1996, at the Roslin Institute in Scotland, became the first mammal to be cloned from an adult somatic cell using the process of nuclear transfer. Named after country music legend Dolly Parton — because the cell used was from a mammary gland — she was created by scientists Ian Wilmut and Keith Campbell. The announcement of her birth on February 22, 1997, sent shockwaves through the scientific community and sparked intense ethical debates about cloning that continue to this day. Dolly was cloned from a cell taken from the mammary gland of a six-year-old Finn Dorset sheep, and it took 277 attempts before a successful embryo was created. She lived her entire life at the Roslin Institute, where she gave birth to several lambs naturally, proving that cloned animals could reproduce. However, Dolly developed arthritis at an unusually young age and was diagnosed with a progressive lung disease, leading to her euthanization on February 14, 2003, at the age of six. Her preserved remains are now displayed at the National Museum of Scotland in Edinburgh.",
      answerType: 'TEXT' as const,
    },
    {
      order: 3,
      questionText: 'Which Spice Girl was known as "Scary Spice"?',
      mediaType: 'NONE' as const,
      mediaUrl: '',
      factLabTitle: 'The Spice Girls and Girl Power',
      factLabContent:
        "Melanie Brown, better known as Mel B or 'Scary Spice,' was one of the five members of the Spice Girls, the best-selling female group of all time. The nicknames were actually coined by the British magazine Top of the Pops in 1996, and the group embraced them wholeheartedly. Mel B earned the 'Scary' moniker due to her bold personality, wild curly hair, and fearless fashion choices that often included leopard print and platform boots. The Spice Girls formed in 1994 after responding to an advertisement in The Stage magazine seeking girls who were 'street smart, extrovert, ambitious, and able to sing and dance.' Their debut single 'Wannabe' reached number one in 37 countries and became the best-selling single by a female group ever. The group's message of 'Girl Power' became a cultural phenomenon that empowered a generation of young women. They sold over 100 million records worldwide, starred in the film 'Spice World,' and even influenced a British general election when they publicly endorsed Tony Blair.",
      answerType: 'TEXT' as const,
    },
  ];

  const SAMPLE_ANSWERS: Record<number, Array<{ text: string; isCorrect: boolean; order: number; votesCount: number }>> = {
    1: [
      { text: 'Nintendo 64', isCorrect: false, order: 1, votesCount: 3456 },
      { text: 'Sega Saturn', isCorrect: false, order: 2, votesCount: 1234 },
      { text: 'PlayStation', isCorrect: true, order: 3, votesCount: 7890 },
      { text: 'Atari Jaguar', isCorrect: false, order: 4, votesCount: 567 },
    ],
    2: [
      { text: 'Polly', isCorrect: false, order: 1, votesCount: 1567 },
      { text: 'Molly', isCorrect: false, order: 2, votesCount: 1234 },
      { text: 'Holly', isCorrect: false, order: 3, votesCount: 890 },
      { text: 'Dolly', isCorrect: true, order: 4, votesCount: 8765 },
    ],
    3: [
      { text: 'Victoria Beckham', isCorrect: false, order: 1, votesCount: 2345 },
      { text: 'Emma Bunton', isCorrect: false, order: 2, votesCount: 1678 },
      { text: 'Melanie Brown', isCorrect: true, order: 3, votesCount: 7654 },
      { text: 'Geri Halliwell', isCorrect: false, order: 4, votesCount: 1890 },
    ],
  };

  for (const q of SAMPLE_QUESTIONS) {
    const [insertedQ] = await db
      .insert(questions)
      .values({ ...q, quizId: sampleQuiz.id })
      .returning();

    const answerData = SAMPLE_ANSWERS[q.order].map((a) => ({
      ...a,
      questionId: insertedQ.id,
    }));

    await db.insert(answers).values(answerData);
    process.stdout.write(`   ✓ Q${q.order}: "${q.questionText.slice(0, 50)}..."\n`);
  }

  // ── 5. Insert default site settings ─────────────────────────────────────
  console.log('\n⚙️  Inserting default site settings...');
  await db.insert(siteSettings).values({
    siteName: 'Quizoi',
    siteDescription:
      'Free online quizzes on every topic imaginable. Challenge your brain with our daily trivia, fact labs, and brain teasers.',
    adsensePublisherId: '',
    adsenseAutoAds: false,
    headerCode: '',
    footerCode: '',
    customCss: '',
    maintenanceMode: false,
  });
  console.log('   ✓ Site settings inserted\n');

  console.log('✅ Seed complete!\n');
  console.log('Next steps:');
  console.log('  1. Add your remaining quizzes via the Admin Panel at /admin');
  console.log('  2. Set your ADSENSE_PUBLISHER_ID in site settings');
  console.log('  3. Publish quizzes when ready\n');

  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
