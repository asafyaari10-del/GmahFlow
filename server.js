// =====================================================================
//  GmahFlow - נקודת הכניסה לשרת
//  המבנה בשכבות (פירוט ב-README):
//    routes  ->  controllers  ->  services  ->  models  ->  PostgreSQL
//    (נתיב)      (קלט/פלט HTTP)   (כללים עסקיים)  (שאילתות SQL)
// =====================================================================
require('dotenv').config();
const app = require('./src/app');
const { startReminderJob } = require('./src/jobs/reminders');

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`GmahFlow is running on http://localhost:${PORT}`);
  startReminderJob();
});
