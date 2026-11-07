// Runs every morning and emails each student at the email on his account:
//   today's plan · missed sessions from yesterday · exam reminders 7 days, 3 days and 1 day before · good luck on exam day.
// 05:00 UTC = 07:00 in Beirut in winter (08:00 in summer).
import type { Config } from "@netlify/functions";
import { adminDb } from "../../lib/firebase/adminCore";
import { sendEmail } from "../../lib/email";

const beirutDay = (offsetDays = 0) => {
  const d = new Date(Date.now() + offsetDays * 86_400_000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Beirut" }).format(d);
};

export default async () => {
  const db = adminDb();
  const today = beirutDay(0), yesterday = beirutDay(-1);
  const REMIND: Record<string, string> = { [beirutDay(7)]: "exam_week", [beirutDay(3)]: "exam_3days", [beirutDay(1)]: "exam_tomorrow", [today]: "exam_today" };
  const users = await db.collection("users").get();
  let plans = 0, reminders = 0;
  for (const u of users.docs) {
    const p = u.data();
    if (!p.email || p.dailyEmails === false) continue;
    const [sessions, missedSnap, courses] = await Promise.all([
      u.ref.collection("sessions").where("date", "==", today).get(),
      u.ref.collection("sessions").where("date", "==", yesterday).get(),
      u.ref.collection("courses").get(),
    ]);
    const missed = missedSnap.docs.map((d) => d.data()).filter((s) => !s.done).map((s) => ({ code: s.courseCode, topic: s.topicTitle }));
    if (missed.length) await sendEmail(p.email, "missed", { items: missed });
    const items = sessions.docs.map((d) => d.data()).filter((s) => !s.done).map((s) => ({ code: s.courseCode, topic: s.topicTitle, minutes: s.minutes }));
    if (items.length && (await sendEmail(p.email, "daily_plan", { name: p.name || "there", today, items }))) plans++;
    for (const c of courses.docs) {
      const kind = REMIND[c.data().examDate];
      if (kind && (await sendEmail(p.email, kind, c.data()))) reminders++;
    }
  }
  console.log(`daily-emails: ${plans} plans, ${reminders} exam reminders`);
};

export const config: Config = { schedule: "0 5 * * *" };
