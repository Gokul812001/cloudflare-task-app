/*********************************
 * CORS HEADERS
 *********************************/
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

/*********************************
 * MAIN WORKER
 *********************************/
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 1️⃣ API ROUTING
    if (path.startsWith("/api/")) {
      return handleApi(request, env);
    }

    // 2️⃣ STATIC ASSETS
    if (env.ASSETS) {
      const asset = await env.ASSETS.fetch(request);

      if (asset.status !== 404) {
        return asset;
      }

      // SPA fallback
      return env.ASSETS.fetch(
        new Request(`${url.origin}/index.html`, request)
      );
    }

    // 3️⃣ FAILSAFE
    return new Response("Assets not configured", { status: 500 });
  }
};

/*********************************
 * API HANDLER
 *********************************/
async function handleApi(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace("/api", "");
  const method = request.method;
  const headers = corsHeaders();

  // CORS PREFLIGHT
  if (method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  // KV — THEME
  if (method === "GET" && path === "/theme") {
    const theme = (await env.KVP.get("theme")) || "light";
    return new Response(JSON.stringify({ theme }), { headers });
  }

  if (method === "POST" && path === "/theme") {
    const body = await request.json();
    await env.KVP.put("theme", body.theme);
    return new Response(JSON.stringify({ success: true }), { headers });
  }

  // AI — SUMMARIZE
  if (method === "POST" && path === "/summarize") {
    const body = await request.json();
    const text = body.text || "";

    const aiRes = await env.AI.run(
      "@cf/meta/llama-3-8b-instruct",
      {
        messages: [
          {
            role: "user",
            content: `Summarize this task in under 10 words: ${text}`
          }
        ]
      }
    );

    return new Response(
      JSON.stringify({ summary: aiRes.response }),
      { headers }
    );
  }

  // D1 — TASK CRUD
  if (method === "GET" && path === "/tasks") {
    const tasks = await listTasks(env);
    return new Response(JSON.stringify(tasks), { headers });
  }

  if (method === "POST" && path === "/tasks") {
    const body = await request.json();
    const task = await createTask(env, body);
    return new Response(JSON.stringify(task), { headers });
  }

  if (method === "PUT" && path.startsWith("/tasks/")) {
    const id = path.split("/")[2];
    const body = await request.json();
    const task = await updateTask(env, id, body);
    return new Response(JSON.stringify(task), { headers });
  }

  if (method === "DELETE" && path.startsWith("/tasks/")) {
    const id = path.split("/")[2];
    await deleteTask(env, id);
    return new Response(JSON.stringify({ success: true }), { headers });
  }

  return new Response("Not Found", { status: 404, headers });
}

/*********************************
 * D1 HELPERS
 *********************************/
async function createTask(env, data) {
  const id = crypto.randomUUID();
  const now = Date.now();

  await env.DB.prepare(
    "INSERT INTO tasks (id, title, completed, created_at) VALUES (?, ?, ?, ?)"
  )
    .bind(id, data.title, 0, now)
    .run();

  return { id, title: data.title, completed: false, created_at: now };
}

async function listTasks(env) {
  const { results } = await env.DB
    .prepare("SELECT * FROM tasks ORDER BY created_at DESC")
    .all();

  return results.map(row => ({
    id: row.id,
    title: row.title,
    completed: !!row.completed,
    created_at: row.created_at
  }));
}

async function updateTask(env, id, data) {
  await env.DB.prepare(
    "UPDATE tasks SET title = ?, completed = ? WHERE id = ?"
  )
    .bind(data.title, data.completed ? 1 : 0, id)
    .run();

  return { id, title: data.title, completed: data.completed };
}

async function deleteTask(env, id) {
  await env.DB.prepare(
    "DELETE FROM tasks WHERE id = ?"
  )
    .bind(id)
    .run();
}
