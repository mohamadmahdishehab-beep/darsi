# Darsi: AI study planner 📚

Next.js + **Firebase** (Auth + Firestore) + Claude AI agent + Gmail emails. **B balesh lal kel**: bas ya3mel account.
Byeshteghel 3al **Spark plan (b balesh)** tab3 Firebase, ma bado Storage.

---

## 🧩 Kif l agent byeshteghel

```
Talib (chat) → /api/agent (server, bi shayyik l Firebase token) → Claude API
                                 ↕
                 lib/agent/tools.ts → Firestore: users/{uid}/...
```

1. L talib byektob msg bl `/chat`, w l browser byeb3at ma3o l **Firebase ID token**
2. `app/api/agent/route.ts` bi shayyik l token w l free limit
3. `lib/agent/run.ts` bib3at l msg la Claude ma3 lista l tools
4. Claude bi2arrer ayya tool, w l server bi shaghghela 3a `users/{uid}` **bas**, ya3ne kel talib bi shuf data tab3o
5. Byerja3 Claude la7atta y5alles (max 10 steps), w l jawab byetsajjal

**L tools:** `get_courses`, `read_slides`, `save_topics`, `create_study_plan`, `get_plan`, `mark_session_done`, `move_session`, `update_topic_mastery`, `get_progress`

## 🗂️ L database (Firestore)

```
users/{uid}                  profile: name, plan, proUntil, messagesUsed
users/{uid}/courses/{id}     code, name, examDate, hoursPerDay
users/{uid}/files/{id}       courseId, fileName, pages, text (l text tab3 l PDF)
users/{uid}/topics/{id}      courseId, title, difficulty, mastery
users/{uid}/sessions/{id}    courseId, courseCode, date, topicTitle, minutes, done
users/{uid}/chat/{id}        role, content, createdAt
```

---

## ✅ Step by step: shu bta3mel connect

### Step 1: Shaghghel l project
```bash
npm install
cp .env.example .env.local
```
Lezem **Node.js 20+**.

### Step 2: E3mel Firebase project
1. Rou7 3a **console.firebase.google.com** → **Create a project** → esmo `darsi`
2. Google Analytics: fik tsakkro, mesh lezem

### Step 3: Authentication (l login)
1. **Build → Authentication → Get started**
2. **Sign-in method** → shaghghel **Email/Password** (kel account lezem ykun 3endo email w password) w **Google** (5tar support email)
3. **Facebook**: (l kabse bta5od l talib 3a safhet Facebook l rasmiye, w nafs l shi la Google) e3mel app 3a **developers.facebook.com** (Facebook Login), nsakh l **App ID** w l **App secret** la Firebase, w nsakh l **OAuth redirect URI** li bya3tik yeh Firebase la Facebook (Facebook Login → Settings → Valid OAuth Redirect URIs)
4. **Settings → Authorized domains**: `localhost` mawjud. Ba3d l deploy zid domain Netlify (Step 9)

### Step 4: Firestore (l database)
1. **Build → Firestore Database → Create database**
2. Location: **eur3 (Europe)** aw `europe-west`
3. 5tar **Production mode**
4. Rou7 3a tab **Rules**, m7i kel shi, 7ott `firestore.rules` men l project, w **Publish**
   ✔️ Hayda bi5alli kel talib bishuf data tab3o bas

### Step 5: Web app config (lal frontend)
1. ⚙️ **Project settings → General** → nzal la ta7t → **Your apps** → kbos `</>` (Web)
2. Esmo `darsi-web` → **Register app**
3. Bitbayyen `firebaseConfig`. Nsakh:
   - `apiKey` → `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `authDomain` → `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `projectId` → `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `appId` → `NEXT_PUBLIC_FIREBASE_APP_ID`

> Hawde mesh seriyin, 3adi ykuno bl browser. L 7imaye men l Rules.

### Step 6: Service account (lal server) ⚠️ SERI
1. ⚙️ **Project settings → Service accounts**
2. **Generate new private key** → byenzal file JSON
3. Men l JSON nsakh:
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (7otto bayn `"..."` metel ma huwe, ma3 l `\n`)
4. **Ma tfarji l file la 7ada, ma t7otto 3a GitHub, w ma tb3ato bl chat**

### Step 7: Claude API (l AI)
1. **console.anthropic.com** → Sign up
2. **Billing** → zid $5 credit
3. **API Keys → Create Key** → 7otto `ANTHROPIC_API_KEY`
4. **Limits**: 7ott spend limit shahre (metel $10)

### Step 7b: Gmail (Darsi byeb3at emails men Gmail tab3ak) 📧
Darsi byeb3at automatic: **Welcome to Darsi**, "exam saved", **plan l yom kel sab7** (7:00), w **reminder 2abel l exam b yom**.
1. Fta7 Gmail li badak tb3at menno (a7san ta3mel wa7ad jdid, metel `darsi.app@gmail.com`)
2. **myaccount.google.com → Security** → shaghghel **2-Step Verification**
3. B nafs l safha: **App passwords** → esmo `Darsi` → **Create** → bya3tik 16 7arf
4. 7ott bl `.env.local` w bi Netlify:
   - `GMAIL_USER=darsi.app@gmail.com`
   - `GMAIL_APP_PASSWORD=` l 16 7arf ⚠️ seri
   - `SITE_URL=https://esm-site.netlify.app`
5. L email l yawmi byeshteghel la7alo 3a Netlify (`netlify/functions/daily-emails.mts`, kel yom 05:00 UTC). Ma bado shi menak.

> Gmail 3endo 7add ~500 email bl yom. Iza kebret, ente2el la service metel Resend aw Brevo.

### Step 8: Kammel `.env.local` w jarreb
```env
ADMIN_EMAIL=email-tabe3ak@gmail.com
```
```bash
npm run dev
```
Efta7 **http://localhost:3000** → fut b **Google** b nafs l email li 7attayto `ADMIN_EMAIL` → zid mede → rfa3 PDF → Chat: "Build my study plan" 🎉

### Step 9: Online 3a Netlify
1. 7ott l project 3a **GitHub** (`.env.local` ma byetla3, huwe bl `.gitignore` ✔️)
2. **netlify.com → Add new site → Import from Git** → 5tar l repo
3. **Site configuration → Environment variables**: zid **kel** l variables li b `.env.local`
   - `FIREBASE_PRIVATE_KEY`: 7otto **bala** l `"` w ma3 l `\n` metel ma huwe
4. **Deploy**
5. Rja3 3a Firebase → **Authentication → Settings → Authorized domains** → **Add domain** → `esm-site.netlify.app`


---

## 📁 L files l mohemme

| File | Shu fi |
|---|---|
| `lib/agent/tools.ts` | l tools li Claude bi2dar yesta3mela |
| `lib/agent/run.ts` | l agent loop + system prompt |
| `lib/firebase/admin.ts` | Firebase Admin (server): token check, profile, free limit |
| `lib/firebase/client.ts` | Firebase lal browser + `api()` helper |
| `app/api/agent/route.ts` | l API tab3 l chat |
| `app/api/upload/route.ts` | rfa3 PDF w ta2ra l text |
| `app/api/admin/route.ts` | stats w lista l tolleb lal owner |
| `firestore.rules` | l security |

## 💸 Nasa2e7
- `CLAUDE_MODEL=claude-haiku-5-5` arkhas, bas l plans btkun a2al jawde
- L PDF lezem ykun fi text (mesh scanned)
- Firebase Spark (b balesh): 50,000 reads w 20,000 writes bl yom, bikaffo ktir bl awwal
