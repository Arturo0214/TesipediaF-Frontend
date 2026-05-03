/**
 * Vite Plugin — Local Agent Chat + Persistence
 * Single middleware that handles all /local/agents/* routes
 */
import { exec } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const AGENTS_DIR = join(process.cwd(), '..', '.claude', 'agents');
const CONVOS_DIR = join(homedir(), 'Desktop', 'Claude-Code', 'tesipedia-outputs', 'agent-conversations');

if (!existsSync(CONVOS_DIR)) mkdirSync(CONVOS_DIR, { recursive: true });

function readAgentPrompt(agentId) {
    const fp = join(AGENTS_DIR, `${agentId}.md`);
    return existsSync(fp) ? readFileSync(fp, 'utf-8') : null;
}

// Read project context from CLAUDE.md
const CLAUDE_MD = (() => {
    const p = join(process.cwd(), '..', 'CLAUDE.md');
    if (existsSync(p)) return readFileSync(p, 'utf-8').slice(0, 600);
    const p2 = join(homedir(), 'CLAUDE.md');
    if (existsSync(p2)) return readFileSync(p2, 'utf-8').slice(0, 600);
    return '';
})();

function buildPrompt(agents, topic, context, prev) {
    const profiles = agents.map(id => {
        const p = readAgentPrompt(id);
        const name = id.charAt(0).toUpperCase() + id.slice(1);
        return p ? `**${name}**: ${p.replace(/^---[\s\S]*?---\n?/, '').trim().slice(0, 400)}` : `**${name}**: Agente Tesipedia`;
    }).join('\n\n');

    let memory = '';
    if (prev?.length) {
        memory = '\nMEMORIA (conversaciones previas):\n' + prev.slice(0, 3).map(c =>
            `- ${c.agents.join('+')} sobre "${c.topic}": ${(c.actions || []).map(a => a.text).join('; ') || 'sin acciones'}`
        ).join('\n') + '\n';
    }

    return `Eres el orquestador de Tesipedia (servicios académicos en México: tesis, tesinas, artículos). Simula una conversación entre ${agents.length} agentes.

PROYECTO: El código está en ~/Desktop/Proyectos-Recientes/Tesipedia-F/ — Backend/ y Frontend/ están en el MISMO repo. NO es el repo de SEDESA.
${CLAUDE_MD ? `\nCONTEXTO TÉCNICO:\n${CLAUDE_MD}\n` : ''}

AGENTES:
${profiles}

TEMA: ${topic}
${context ? `CONTEXTO: ${context}\n` : ''}${memory}
REGLAS:
1. Máximo 6-8 mensajes, conversación natural
2. Cada agente habla desde su expertise
3. CONCLUSIONES ACCIONABLES al final
4. Sección "## ACCIONES" con 3-5 items: "- [AGENTE] Acción (Plazo: X días)"
5. Formato: "[NombreAgente]: mensaje"
6. En español, directo, sin fluff

CONVERSACIÓN:`;
}

function parseActions(response) {
    const actions = [];
    const section = response.includes('## ACCIONES') ? response.split('## ACCIONES').pop() : '';
    section.split('\n').filter(l => l.trim().startsWith('-')).forEach(line => {
        const m = line.match(/^\s*-\s*\[(\w+)\]\s*(.*?)(?:\(Plazo:\s*(.+?)\))?$/);
        if (m) actions.push({ agent: m[1], text: m[2].trim(), deadline: m[3]?.trim() || '', done: false });
        else actions.push({ agent: '', text: line.replace(/^\s*-\s*/, '').trim(), deadline: '', done: false });
    });
    return actions;
}

function loadConversations() {
    try {
        return readdirSync(CONVOS_DIR).filter(f => f.endsWith('.json')).sort().reverse()
            .map(f => { try { return JSON.parse(readFileSync(join(CONVOS_DIR, f), 'utf-8')); } catch { return null; } })
            .filter(Boolean);
    } catch { return []; }
}

function readBody(req) {
    return new Promise((resolve) => {
        let body = '';
        req.on('data', c => { body += c; });
        req.on('end', () => { try { resolve(JSON.parse(body)); } catch { resolve(null); } });
    });
}

// Meta Ads data fetcher (uses backend's token)
async function fetchMetaAdsData() {
    try {
        const envPath = join(process.cwd(), '..', 'Backend', '.env');
        if (!existsSync(envPath)) return null;
        const envContent = readFileSync(envPath, 'utf-8');
        const token = envContent.match(/META_ACCESS_TOKEN=(.+)/)?.[1]?.trim();
        const accountId = envContent.match(/META_AD_ACCOUNT_ID=(.+)/)?.[1]?.trim();
        if (!token || !accountId) return null;

        const today = new Date().toISOString().slice(0, 10);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

        // Fetch campaign insights (last 30 days)
        const url = `https://graph.facebook.com/v21.0/act_${accountId}/insights?fields=campaign_name,spend,impressions,clicks,actions,cpc,cpm,ctr&time_range={"since":"${thirtyDaysAgo}","until":"${today}"}&level=campaign&limit=10&access_token=${token}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
        if (!res.ok) return { error: `Meta API ${res.status}` };
        const data = await res.json();
        return data.data || [];
    } catch (e) {
        return { error: e.message };
    }
}

export default function agentChatPlugin() {
    return {
        name: 'vite-agent-chat',
        configureServer(server) {
            server.middlewares.use(async (req, res, next) => {
                const url = req.url || '';

                // Only handle /local/agents/* routes
                if (!url.startsWith('/local/agents')) return next();

                res.setHeader('Content-Type', 'application/json');

                // GET /local/agents/conversations
                if (url === '/local/agents/conversations' && req.method === 'GET') {
                    return res.end(JSON.stringify({ conversations: loadConversations() }));
                }

                // POST /local/agents/chat-stream — SSE streaming conversation
                if (url === '/local/agents/chat-stream' && req.method === 'POST') {
                    const body = await readBody(req);
                    if (!body?.agents?.length || !body?.topic) {
                        res.statusCode = 400;
                        return res.end(JSON.stringify({ error: 'agents and topic required' }));
                    }

                    const prev = loadConversations().slice(0, 5);
                    const prompt = buildPrompt(body.agents, body.topic, body.context, prev);

                    // SSE headers
                    res.writeHead(200, {
                        'Content-Type': 'text/event-stream',
                        'Cache-Control': 'no-cache',
                        'Connection': 'keep-alive',
                    });

                    console.log(`[AgentChat:Stream] ${body.agents.join(' + ')} → "${body.topic}"`);

                    const tmpFile = join(CONVOS_DIR, '_prompt.tmp');
                    writeFileSync(tmpFile, prompt);

                    const { spawn } = await import('child_process');
                    const claudePath = process.env.HOME + '/.nvm/versions/node/v20.18.0/bin/claude';
                    const child = spawn(claudePath, ['-p', '--output-format', 'stream-json'], {
                        stdio: ['pipe', 'pipe', 'pipe'],
                        timeout: 180000,
                        env: { ...process.env, PATH: process.env.PATH + ':/usr/local/bin:/usr/bin' },
                    });

                    let fullResponse = '';

                    child.stdout.on('data', (data) => {
                        const text = data.toString();
                        fullResponse += text;
                        // Send each chunk as SSE event
                        res.write(`data: ${JSON.stringify({ type: 'chunk', text })}\n\n`);
                    });

                    child.stderr.on('data', (data) => {
                        // Some stderr is normal (progress indicators)
                    });

                    child.stdin.write(prompt);
                    child.stdin.end();

                    child.on('close', (code) => {
                        // Try to parse as stream-json, fallback to raw text
                        let response = fullResponse.trim();

                        // If stream-json format, extract the text content
                        try {
                            const lines = response.split('\n').filter(l => l.trim());
                            const texts = [];
                            for (const line of lines) {
                                try {
                                    const obj = JSON.parse(line);
                                    if (obj.type === 'content' || obj.type === 'text') {
                                        texts.push(obj.content || obj.text || '');
                                    } else if (obj.type === 'result') {
                                        texts.push(obj.result || '');
                                    }
                                } catch {
                                    texts.push(line);
                                }
                            }
                            if (texts.length > 0 && texts.some(t => t.length > 10)) {
                                response = texts.join('');
                            }
                        } catch {}

                        const convo = {
                            id: Date.now(),
                            agents: body.agents,
                            topic: body.topic,
                            context: body.context || '',
                            response,
                            actions: parseActions(response),
                            date: new Date().toISOString(),
                            status: 'completed',
                        };

                        writeFileSync(join(CONVOS_DIR, `${convo.id}.json`), JSON.stringify(convo, null, 2));

                        // Send final event with complete convo
                        res.write(`data: ${JSON.stringify({ type: 'done', convo })}\n\n`);
                        res.end();
                    });

                    // Handle client disconnect
                    req.on('close', () => {
                        child.kill();
                    });

                    return;
                }

                // GET /local/agents/meta-ads
                if (url === '/local/agents/meta-ads' && req.method === 'GET') {
                    const data = await fetchMetaAdsData();
                    return res.end(JSON.stringify({ campaigns: data }));
                }

                // POST /local/agents/chat
                if (url === '/local/agents/chat' && req.method === 'POST') {
                    const body = await readBody(req);
                    if (!body?.agents?.length || !body?.topic) {
                        res.statusCode = 400;
                        return res.end(JSON.stringify({ error: 'agents and topic required' }));
                    }

                    const prev = loadConversations().slice(0, 5);
                    const prompt = buildPrompt(body.agents, body.topic, body.context, prev);

                    console.log(`[AgentChat] ${body.agents.join(' + ')} → "${body.topic}"`);

                    // Write prompt to temp file
                    const tmpFile = join(CONVOS_DIR, '_prompt.tmp');
                    writeFileSync(tmpFile, prompt);

                    // Use spawn instead of exec for better stdin handling
                    const { spawn } = await import('child_process');
                    const claudePath = process.env.HOME + '/.nvm/versions/node/v20.18.0/bin/claude';
                    const child = spawn(claudePath, ['-p'], {
                        stdio: ['pipe', 'pipe', 'pipe'],
                        timeout: 180000,
                        env: { ...process.env, PATH: process.env.PATH + ':/usr/local/bin:/usr/bin' },
                    });

                    let stdout = '';
                    let stderr = '';
                    child.stdout.on('data', (data) => { stdout += data.toString(); });
                    child.stderr.on('data', (data) => { stderr += data.toString(); });

                    // Write prompt to stdin and close it
                    child.stdin.write(prompt);
                    child.stdin.end();

                    child.on('close', (code) => {
                        if (code !== 0 && !stdout.trim()) {
                            console.error('[AgentChat] Error:', stderr || `exit code ${code}`);
                            res.statusCode = 500;
                            return res.end(JSON.stringify({ error: `Command failed (exit ${code}): ${stderr.slice(0, 200)}` }));
                        }

                        const response = stdout.trim();
                        const convo = {
                            id: Date.now(),
                            agents: body.agents,
                            topic: body.topic,
                            context: body.context || '',
                            response,
                            actions: parseActions(response),
                            date: new Date().toISOString(),
                            status: 'completed',
                        };

                        writeFileSync(join(CONVOS_DIR, `${convo.id}.json`), JSON.stringify(convo, null, 2));
                        console.log(`[AgentChat] Done. Saved ${convo.id}.json`);
                        res.end(JSON.stringify(convo));
                    });
                    return;
                }

                // PATCH /local/agents/action
                if (url === '/local/agents/action' && req.method === 'PATCH') {
                    const body = await readBody(req);
                    const fp = join(CONVOS_DIR, `${body?.convoId}.json`);
                    if (!existsSync(fp)) { res.statusCode = 404; return res.end(JSON.stringify({ error: 'not found' })); }
                    const convo = JSON.parse(readFileSync(fp, 'utf-8'));
                    if (convo.actions?.[body.actionIndex] !== undefined) {
                        convo.actions[body.actionIndex].done = body.done;
                        writeFileSync(fp, JSON.stringify(convo, null, 2));
                    }
                    return res.end(JSON.stringify({ ok: true, convo }));
                }

                next();
            });
        },
    };
}
