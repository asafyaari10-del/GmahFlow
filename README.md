# GmahFlow · גמ"ח השאלת ציוד קהילתי

מערכת לניהול גמ"ח השאלת ציוד: קטלוג עם זמינות בזמן אמת, שריון לתאריך עתידי, מסירה והחזרה עם סריקת QR, בקרת נזקים וקנסות, תזכורות, משובים, תרומות ודוחות BI.

**טכנולוגיות:** Node.js + Express (שרת) · PostgreSQL (מסד נתונים) · HTML/CSS/jQuery (ממשק)

---

## התקנה והרצה (Windows / Mac)

1. **מתקינים** [Node.js](https://nodejs.org) גרסה 18 ומעלה ו-[PostgreSQL](https://www.postgresql.org/download/) גרסה 14 ומעלה (כולל pgAdmin).
2. **יוצרים מסד נתונים** בשם `gmahflow`: ב-pgAdmin לוחצים ימני על Databases ← Create ← Database, או ב-psql:
   ```sql
   CREATE DATABASE gmahflow;
   ```
3. **מגדירים סיסמה**: מעתיקים את הקובץ `.env.example` לקובץ חדש בשם `.env` וממלאים את הסיסמה של משתמש `postgres`.
4. **מתקינים חבילות ובונים את הטבלאות**, בטרמינל בתיקיית הפרויקט:
   ```bash
   npm install
   npm run db:init
   ```
   הפקודה השנייה מריצה את `db/01_create_tables.sql` ואחריו את `db/02_insert_data.sql`. היא **מוחקת ובונה מחדש** את כל הטבלאות, כך שאפשר להריץ אותה שוב בכל פעם שרוצים להתחיל מנתוני דמו נקיים.
5. **מפעילים את השרת:**
   ```bash
   npm start
   ```
   ופותחים בדפדפן: http://localhost:3000

**הרצה ידנית ב-pgAdmin (בלי Node):** פותחים Query Tool על המסד `gmahflow`, טוענים את `db/01_create_tables.sql` ומריצים, ואחריו את `db/02_insert_data.sql`.

### משתמשי דמו (סיסמה לכולם: `Gmah1234`)

| תפקיד | ת"ז | טלפון |
|---|---|---|
| מנהל גמ"ח | 300000007 | 0500000001 |
| נאמן ציוד | 200000008 | 0500000002 |
| שואל | 123456782 | 0521234567 |
| שואל עם השאלה באיחור | 204567895 | 0533334444 |

במסך ההתחברות יש כפתורי קיצור לשלושת התפקידים.

---

## מבנה הפרויקט: הפרדה לשכבות

כל בקשה עוברת באותו מסלול, וכל שכבה אחראית על דבר אחד בלבד:

```
routes  →  controllers  →  services  →  models  →  PostgreSQL
```

| שכבה | אחריות | מה **אין** בה |
|---|---|---|
| `routes/` | איזו כתובת URL, איזו הרשאה, איזה controller | לוגיקה, SQL |
| `controllers/` | קריאת הקלט מהבקשה, בדיקת תקינות, החזרת JSON וקוד HTTP | SQL, כללים עסקיים |
| `services/` | הכללים העסקיים מהאפיון (זכאות, קנסות, פיצול החזרות) וטרנזקציות | `req`/`res`, SQL |
| `models/` | שאילתות SQL בלבד, אחת לכל פעולה | כללים עסקיים, HTTP |
| `middleware/` | התחברות והרשאות, כותרות אבטחה, טיפול מרכזי בשגיאות | |

```
server.js                  נקודת הכניסה: טוען הגדרות ומפעיל את השרת
src/
  app.js                   הרכבת Express: אבטחה, קבצים סטטיים, API, שגיאות
  config/db.js             חיבור ל-PostgreSQL (מתוך .env) + פונקציית טרנזקציה
  middleware/
    auth.js                סשן מעוגייה, requireLogin / requireStaff / requireAdmin
    security.js            כותרות אבטחה ו-Content-Security-Policy
    errorHandler.js        הודעת שגיאה ברורה למשתמש ופירוט ביומן השרת
  routes/                  index.js + קובץ לכל מודול (authRoutes, loanRoutes ...)
  controllers/             auth, catalog, item, loan, feedback, donation,
                           notification, report, user, external
  services/                אותם מודולים: הלוגיקה העסקית
  models/                  user, session, catalog, item, loan, feedback,
                           donation, notification, report: שאילתות SQL
  utils/
    validate.js            בדיקות קלט (כולל ספרת ביקורת של ת"ז)
    errors.js              שגיאות עם הודעה בעברית + תרגום שגיאות PostgreSQL
  jobs/reminders.js        תזכורת SMS יום לפני החזרה + התראות איחור (כל שעה)
db/
  01_create_tables.sql     יצירת כל הטבלאות, אילוצים, אינדקסים, פונקציה, טריגר ו-Views
  02_insert_data.sql       הזנת תוכן ראשוני (כולל חצי שנה של היסטוריה לדוחות)
scripts/init-db.js         מריץ את שני קובצי ה-SQL לפי הסדר (npm run db:init)
public/                    הממשק (צד לקוח)
  index.html  css/style.css
  js/core.js               כלים משותפים (קריאות API, הגנת XSS, ניתוב, חלונות)
  js/public.js             מסכי שואל: בית, קטלוג, התחברות, השאלות, תרומה, משוב
  js/staff.js              עמדת נאמן: מסירה, החזרה, סריקה, תקלות, תרומות, ספירה
  js/admin.js              מנהל: דשבורד, דוחות, קטלוג, משובים, חובות, משתמשים
  vendor/                  jQuery, Chart.js, QRCode.js (שמורים מקומית)
```

**דוגמה למסלול אחד, החזרת ציוד:** `loanRoutes` (רק נאמן/מנהל) ← `loanController.processReturn` (בודק שמצב כל פריט הוא Good/Damaged/Lost) ← `loanService.processReturn` (איחור מחייב הערה, קנס לפי מחירון הקטלוג, סגירת ההשאלה, טרנזקציה אחת) ← `loanModel` + `itemModel` (ה-UPDATE-ים עצמם).

## מפתחות וסיסמאות

אין בקוד אף סיסמה או מפתח. פרטי החיבור למסד הנתונים נקראים מקובץ `.env` שלא נכלל בגיט (`.gitignore`), ובפרויקט יש רק תבנית ריקה: `.env.example`.

## מיפוי לטבלאות ה-ERD באפיון

| באפיון | בטבלה | הערות |
|---|---|---|
| User | `users` | + `password_hash`, `salary` לנאמנים, `is_active` |
| feedback | `feedbacks` | משוב אחד להשאלה (`loan_id UNIQUE`) |
| question | `questions` | `is_open_q` = שאלה פתוחה, אחרת דירוג 1-5 |
| Ans (M:N) | `feedback_answers` | |
| Item Type | `item_types` | |
| catalog Item | `catalog_items` | הכמות (`quantity`) מחושבת ב-View `v_catalog_stock` ולא נשמרת, כדי שלא תצא מסנכרון |
| Item | `items` | `status` = זמינות, `item_status` = מצב פיזי |
| Loan | `loans` + `loan_items` | תאריך יעד נפרד לכל פריט (פיצול החזרות) |
| Donation (ISA disjoint) | `donations` → `money_donations` / `item_donations` | ה-disjoint נאכף במסד הנתונים |

## אחרי ההגשה: מה עוד אפשר לחבר

- **SMS אמיתי**: בקובץ `src/jobs/reminders.js` להחליף את `console.log` בקריאה לספק SMS.
- **סליקה אמיתית**: בקובץ `src/services/donationService.js` להעביר את המשתמש לדף התשלום של חברת הסליקה ולשמור רק את האסמכתא שחוזרת.
