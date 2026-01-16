# Cloudflare Full-Stack Task App

A full-stack task management application built on the Cloudflare developer platform using Workers, D1, KV, Workers AI and Pages.
This project demonstrates modern edge-first architecture using Cloudflare as a complete application runtime.

---

## 🚀 Tech Stack

* **Cloudflare Workers** – Serverless backend API
* **Cloudflare D1** – Relational SQL task storage
* **Cloudflare KV** – User preference storage (theme mode)
* **Workers AI** – Task text summarization (bonus)
* **Cloudflare Pages** – Frontend static hosting
* **Wrangler** – Local dev + deployment tool

---

## 🎯 Features

✔ CRUD operations for tasks
✔ Relational persistence using D1
✔ Summarization via Workers AI (bonus)
✔ KV for theme preference (light/dark)
✔ Global low-latency edge execution
✔ Simple HTML + Fetch frontend
✔ Proper REST verbs + JSON responses
✔ CORS support for cross-origin UI
✔ Deployed frontend + backend

---

## 🗄 Database Schema (D1)

```sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  completed INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
```

---

## 🌐 Architecture Overview

```
         +----------------------+
         |   Cloudflare Pages   |
         |  (Frontend UI)       |
         +----------+-----------+
                    |
                    | fetch()
                    v
          +---------+----------+
          |  Cloudflare Worker |
          |   (REST API)       |
          +----+-----------+---+
               |           |
        +------+           +------+
        |                         |
     (D1 SQL)                  (KV Store)
  Task persistence          User preferences

               +--------------+
               | Workers AI   |
               | Summarizer   |
               +--------------+
```

---

## 📁 Project Structure

```
/public
  └─ index.html        # UI

/src
  └─ index.js          # Workers API

/migrations
  └─ 001_init.sql      # D1 schema

wrangler.jsonc
README.md
```

---

## 📡 API Endpoints

| Method | Endpoint     | Purpose                   |
| ------ | ------------ | ------------------------- |
| GET    | `/tasks`     | List all tasks            |
| POST   | `/tasks`     | Create task               |
| PUT    | `/tasks/:id` | Update task               |
| DELETE | `/tasks/:id` | Delete task               |
| POST   | `/summarize` | Summarize text via AI     |
| GET    | `/theme`     | Get theme preference (KV) |
| POST   | `/theme`     | Set theme preference (KV) |

---

## 🧩 Frontend (Pages)

Served at:

```
https://cloudflare-task-ui.pages.dev/
```

Uses:

```js
fetch(API_URL + "/tasks")
```

to communicate with backend.

---

## 🧰 Worker Commands

Run locally:

```
npx wrangler dev
```

Apply D1 migrations:

```
npx wrangler d1 migrations apply tasks_db
```

Deploy Worker:

```
npx wrangler deploy
```

Deploy UI (Pages):

Manual upload of `/public` folder.

---

## 🔐 Bindings

Defined in `wrangler.jsonc`:

```jsonc
{
  "d1_databases": [{ "binding": "DB", ... }],
  "kv_namespaces": [{ "binding": "ui_prefs", ... }]
}
```

Workers AI accessed via:

```js
env.AI.run()
```

---

## 🌍 Deployment

**Backend API (Workers):**

```
https://cloudflare-task-app.nexarq-test.workers.dev/
```

**Frontend UI (Pages):**

```
https://cloudflare-task-ui.pages.dev/
```

---

## 📚 Future Improvements

* Authentication / Authorization
* User-level task filtering
* Paginated list
* Improved UI/UX framework (React)
* Offline caching / PWA
* Error UI surfaces
* CI/CD (GitHub Actions)

---

## 📝 License

MIT
