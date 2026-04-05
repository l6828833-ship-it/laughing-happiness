# How to Add More Quizzes to Quizoi

All quiz content lives in one single file:

```
/home/ubuntu/quizoi/client/src/lib/data.ts
```

You never need to touch any other file to add a new quiz.

---

## Step 1 — Pick a Category ID

The existing categories and their IDs are:

| ID | Name | Emoji |
|----|------|-------|
| `music` | Music | 🎵 |
| `sports` | Sports | 🏆 |
| `geography` | Geography | 🌍 |
| `history` | History | 🏛 |
| `science` | Science | 🔬 |
| `movies-tv` | Movies & TV | 🎬 |
| `maths-logic` | Maths & Logic | 📐 |
| `pub-quiz` | Pub Quiz | 🍺 |
| `brain-training` | Brain Training | 🧠 |
| `visual-puzzles` | Visual Puzzles | 👁 |

---

## Step 2 — Add the Quiz Object

Open `client/src/lib/data.ts` and scroll to the `quizzes` array. Copy this template and paste it **inside** the array:

```ts
{
  id: 'quiz-4',                          // Must be unique (increment from last)
  slug: 'your-quiz-slug-here',           // URL-safe, lowercase, hyphens only
  title: 'Your Quiz Title Here',
  description: 'A short 1-2 sentence description shown on the quiz card.',
  categoryId: 'music',                   // Must match a category ID above
  thumbnailUrl: 'https://images.unsplash.com/photo-XXXXXXXXX?w=800&q=80',
  questionCount: 10,
  playCount: 5000,                       // Starting play count (for social proof)
  status: 'PUBLISHED',                   // Always 'PUBLISHED' for live quizzes
  createdAt: '2026-03-26',
  questions: [
    // 10 question objects go here (see Step 3)
  ],
},
```

---

## Step 3 — Add 10 Questions

Each question follows this exact structure:

```ts
{
  id: 'q4-1',                            // quiz-number + question-number
  questionText: 'What year did The Beatles release Abbey Road?',
  mediaType: 'NONE',                     // 'NONE', 'IMAGE', or 'YOUTUBE'
  mediaUrl: null,                        // URL string or null
  factLabTitle: 'The Making of Abbey Road',
  factLabContent: `Write 150+ words of original, educational content here.
    This is the "Did You Know?" section that appears below the answers.
    It must be original, informative, and related to the question topic.
    Google AdSense requires this content to be at least 150 words per question.
    Talk about the history, context, interesting facts, and related trivia.
    The more engaging and educational this content is, the better your
    AdSense RPM will be because users spend more time on the page.
    Include specific dates, names, and facts to make it authoritative.
    Avoid copying from Wikipedia — write it in your own words.`,
  answers: [
    { id: 'q4-1-a', text: '1967', isCorrect: false, voteCount: 1200 },
    { id: 'q4-1-b', text: '1969', isCorrect: true,  voteCount: 8400 },
    { id: 'q4-1-c', text: '1971', isCorrect: false, voteCount: 900 },
    { id: 'q4-1-d', text: '1965', isCorrect: false, voteCount: 600 },
  ],
},
```

**Rules:**
- Exactly **one** answer must have `isCorrect: true`
- `voteCount` numbers create the poll percentages shown on the reveal page — make them realistic (the correct answer should usually have the highest count)
- `factLabContent` must be **150+ words** — this is required for AdSense compliance
- `id` values must be unique across all questions

---

## Step 4 — Update the Category Quiz Count

After adding a quiz, update the `quizCount` for its category in the `categories` array:

```ts
{ id: 'music', name: 'Music', ..., quizCount: 6 },  // Was 5, now 6
```

---

## Full Example: A Complete 10-Question Quiz

Here is a ready-to-paste example quiz about World History:

```ts
{
  id: 'quiz-4',
  slug: 'world-history-ultimate-quiz',
  title: 'Can You Pass This World History Quiz?',
  description: 'From ancient civilizations to modern events — test your knowledge of history\'s most pivotal moments.',
  categoryId: 'history',
  thumbnailUrl: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800&q=80',
  questionCount: 10,
  playCount: 8200,
  status: 'PUBLISHED',
  createdAt: '2026-03-26',
  questions: [
    {
      id: 'q4-1',
      questionText: 'In what year did World War II end?',
      mediaType: 'NONE',
      mediaUrl: null,
      factLabTitle: 'The End of World War II',
      factLabContent: `World War II officially ended in 1945, but the exact date depends on the theatre of war. In Europe, Germany surrendered on May 8, 1945 — a day now commemorated as Victory in Europe Day (VE Day). However, the war in the Pacific continued for several more months. Japan formally surrendered on September 2, 1945, aboard the USS Missouri in Tokyo Bay, following the devastating atomic bombings of Hiroshima on August 6 and Nagasaki on August 9. This date is known as Victory over Japan Day (VJ Day). The total death toll of World War II is estimated at between 70 and 85 million people, making it the deadliest conflict in human history. The war fundamentally reshaped the global political order, leading to the Cold War, the formation of the United Nations, and the beginning of the decolonization movement across Asia and Africa.`,
      answers: [
        { id: 'q4-1-a', text: '1943', isCorrect: false, voteCount: 800 },
        { id: 'q4-1-b', text: '1944', isCorrect: false, voteCount: 1200 },
        { id: 'q4-1-c', text: '1945', isCorrect: true,  voteCount: 9100 },
        { id: 'q4-1-d', text: '1946', isCorrect: false, voteCount: 600 },
      ],
    },
    // ... add 9 more questions following the same pattern
  ],
},
```

---

## Tips for High-Converting Quizzes

| Factor | Recommendation |
|--------|---------------|
| **Title formula** | "Can You Score 10/10 On This [Topic] Quiz?" or "Only [X]% of People Can Pass This [Topic] Quiz" |
| **Difficulty** | Mix easy (3), medium (5), and hard (2) questions — never all-hard |
| **Correct answer position** | Randomize — don't always put the correct answer in position B |
| **Vote counts** | Make the correct answer have ~50–70% of votes for realism |
| **Fact Lab length** | 200–300 words is ideal — longer = more AdSense-eligible content per page |
| **Thumbnail image** | Use Unsplash images at `?w=800&q=80` for fast loading |
| **Category balance** | Aim for 5–10 quizzes per category before moving to a new one |

---

## Quick Reference: Adding a Quiz Checklist

- [ ] Unique `id` (e.g., `quiz-4`, `quiz-5`, ...)
- [ ] Unique `slug` (URL-safe, e.g., `ultimate-music-quiz-2026`)
- [ ] `categoryId` matches an existing category
- [ ] Exactly 10 questions
- [ ] Each question has exactly 1 `isCorrect: true` answer
- [ ] Each `factLabContent` is 150+ words
- [ ] All `id` values are unique (quiz-level and answer-level)
- [ ] `status` is set to `'PUBLISHED'`
- [ ] Category `quizCount` updated in the `categories` array
