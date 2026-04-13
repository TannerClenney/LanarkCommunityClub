import { db } from "@/lib/db";
import { BOARD_OR_ADMIN_ROLES } from "@/lib/roles";

export type ClubTopicDefinition = {
  title: string;
  summary: string;
  body: string;
  locked: boolean;
};

export const CLUB_TOPIC_DEFINITIONS: ClubTopicDefinition[] = [
  {
    title: "Club Rules",
    summary: "Short guiding principles for how we show up, work together, and follow through as a club.",
    body:
      "Welcome to the Lanark Community Club. This topic is our shared baseline for how we participate and work together.\n\n- Our fun funds community improvement.\n- This is a 21-and-older club space.\n- Membership is invite-only or sponsor-supported.\n- Respectful conduct is expected in person and online.\n- Follow-through matters when you volunteer to help.\n\nWe will keep this simple and practical, and expand it only when the club truly needs more detail.",
    locked: true,
  },
  {
    title: "Meeting Notes & Updates",
    summary: "A running place for monthly notes, officer updates, and important club announcements that members should not miss.",
    body:
      "Use this space for monthly meeting notes, leadership updates, and important club business that members may need to reference later.\n\nHelpful uses for this topic:\n- recap meeting decisions and next steps\n- share officer or board updates\n- post special announcements outside the normal meeting cycle\n- flag emergent needs or issues the club should be aware of\n\nKeep updates clear, short, and easy to skim.",
    locked: false,
  },
  {
    title: "Upcoming Event Coordination",
    summary: "A practical planning space for upcoming events so the work stays organized and the general board stays cleaner.",
    body:
      "This topic is for current event planning and day-of coordination. Use it to keep event chatter in one place and make it easier to see what is covered, what is changing, and what still needs attention.\n\nGood fits here:\n- planning notes for upcoming events\n- setup and teardown coordination\n- volunteer coverage gaps\n- quick day-of reminders\n- ideas to capture for future improvements or retrospectives",
    locked: false,
  },
  {
    title: "Volunteer Needs",
    summary: "A place to tell the story of where extra help matters and how volunteer support turns into real value for the club and community.",
    body:
      "Use this topic to highlight where one extra set of hands can make a real difference.\n\nWhen posting here, explain:\n- what help is needed\n- why it matters\n- what value it creates for fundraising or community improvement\n\nExamples might include beer tent support, fried food help, raffle coverage, setup, cleanup, or small behind-the-scenes jobs that keep events running well.",
    locked: false,
  },
];

export const CLUB_TOPIC_TITLES = CLUB_TOPIC_DEFINITIONS.map((topic) => topic.title);

export function getClubTopicDefinition(title: string) {
  return CLUB_TOPIC_DEFINITIONS.find((topic) => topic.title === title) ?? null;
}

export function getThreadPreview(body: string, maxLength = 160) {
  const collapsed = body.replace(/\s+/g, " ").trim();
  if (collapsed.length <= maxLength) {
    return collapsed;
  }

  return `${collapsed.slice(0, maxLength - 1).trimEnd()}…`;
}

export async function ensurePinnedClubTopics() {
  const existingTopics = await db.thread.findMany({
    where: { title: { in: CLUB_TOPIC_TITLES } },
    select: {
      id: true,
      title: true,
      body: true,
      pinned: true,
      locked: true,
      archived: true,
    },
  });

  const existingByTitle = new Map(existingTopics.map((thread) => [thread.title, thread]));

  let fallbackAuthorId: string | null = null;
  if (existingTopics.length < CLUB_TOPIC_DEFINITIONS.length) {
    const boardAuthor = await db.user.findFirst({
      where: { role: { in: BOARD_OR_ADMIN_ROLES } },
      select: { id: true },
      orderBy: { createdAt: "asc" },
    });

    const anyAuthor =
      boardAuthor ??
      (await db.user.findFirst({
        select: { id: true },
        orderBy: { createdAt: "asc" },
      }));

    fallbackAuthorId = anyAuthor?.id ?? null;
  }

  for (const topic of CLUB_TOPIC_DEFINITIONS) {
    const existing = existingByTitle.get(topic.title);

    if (!existing) {
      if (!fallbackAuthorId) {
        continue;
      }

      await db.thread.create({
        data: {
          title: topic.title,
          body: topic.body,
          authorId: fallbackAuthorId,
          pinned: true,
          locked: topic.locked,
          archived: false,
        },
      });
      continue;
    }

    if (existing.archived) {
      continue;
    }

    const shouldPin = !existing.pinned;
    const shouldLock = topic.locked && !existing.locked;
    const shouldFillBody = !existing.body.trim();

    if (shouldPin || shouldLock || shouldFillBody) {
      await db.thread.update({
        where: { id: existing.id },
        data: {
          pinned: true,
          locked: topic.locked ? true : existing.locked,
          ...(shouldFillBody ? { body: topic.body } : {}),
        },
      });
    }
  }
}

export async function getPinnedClubTopics() {
  await ensurePinnedClubTopics();

  const threads = await db.thread.findMany({
    where: {
      archived: false,
      pinned: true,
      title: { in: CLUB_TOPIC_TITLES },
    },
    include: {
      author: { select: { name: true } },
      _count: { select: { posts: { where: { archived: false } } } },
    },
  });

  return CLUB_TOPIC_DEFINITIONS.map((definition) => {
    const thread = threads.find((item) => item.title === definition.title);
    return thread ? { ...thread, summary: definition.summary } : null;
  }).filter((thread): thread is NonNullable<(typeof threads)[number] & { summary: string }> => Boolean(thread));
}
