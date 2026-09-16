// Supabase Edge Function: ai-proxy
// 英语学习网站 / 作文平台共用的「大模型代理」。
// 前端不再持有任何模型厂商的 Key，只带公开的 publishable key 调本函数。
//
// 部署要点：
//   1. Supabase Dashboard -> Project Settings -> Edge Functions -> Secrets
//      新增 DASHSCOPE_API_KEY（通义千问）。可选：ZHIPU_API_KEY（智谱，供免费模型用）
//   2. 本函数必须把 Verify JWT 设为 Disable（新版 sb_publishable_ key 不是 JWT），
//      鉴权由函数内的 apikey 校验完成。
//   3. 禁止在本文件里硬编码任何 sk- 开头的密钥。

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const DASHSCOPE_URL =
  "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
const ZHIPU_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

// 模型白名单：防止代理被拿去跑高价模型（qwen-max / 视频 / 图像生成等一律拒绝）
const ALLOWED_MODELS = new Set<string>([
  "qwen-vl-max",
  "qwen-vl-plus",
  "qwen-vl-ocr",
  "qwen-plus",
  "qwen-turbo",
  "qwen-flash",
  "qwen3-vl-flash",
  "glm-4.6v-flash",
  "glm-4.7-flash",
]);

// 单次请求输出上限：防止被拿去刷长文本
const MAX_TOKENS_CAP = 4096;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// 允许的 apikey = 项目 publishable key（公开值，仅用于挡掉裸奔请求）
// 优先读 env SUPABASE_PUBLISHABLE_KEYS，兜底读单值 SUPABASE_PUBLISHABLE_KEY
const FALLBACK_PUBLISHABLE =
  "sb_publishable_PqN5m9yOrWZzBazFjO7Y_w_pfIMO1PI";
const EXPECTED_KEYS = (() => {
  const keys = new Set<string>();
  const rawList = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") || "";
  if (rawList) {
    try {
      const obj = JSON.parse(rawList);
      for (const v of Object.values(obj)) keys.add(String(v));
    } catch {
      // 忽略：格式非法时退回下面的兜底
    }
  }
  const single = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || "";
  if (single) keys.add(single);
  keys.add(FALLBACK_PUBLISHABLE);
  return keys;
})();

function jsonResp(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }
  if (req.method !== "POST") {
    return jsonResp({ error: "仅支持 POST" }, 405);
  }

  const authKey = req.headers.get("apikey") || "";
  if (!authKey || !EXPECTED_KEYS.has(authKey)) {
    return jsonResp({ error: "apikey 无效" }, 401);
  }

  let body: {
    model?: string;
    messages?: unknown;
    temperature?: number;
    top_p?: number;
    max_tokens?: number;
    response_format?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return jsonResp({ error: "请求体不是合法 JSON" }, 400);
  }

  const model = String(body.model || "");
  if (!model) {
    return jsonResp({ error: "缺少 model 字段" }, 400);
  }
  if (!ALLOWED_MODELS.has(model)) {
    return jsonResp(
      { error: `模型 ${model} 不在白名单内` },
      403,
    );
  }
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return jsonResp({ error: "缺少 messages 字段" }, 400);
  }

  // 归一化并封顶输出长度
  const maxTokens = Number(body.max_tokens);
  const payload = {
    model,
    messages: body.messages,
    temperature: typeof body.temperature === "number" ? body.temperature : 0.2,
    top_p: typeof body.top_p === "number" ? body.top_p : 1,
    max_tokens:
      Number.isFinite(maxTokens) && maxTokens > 0
        ? Math.min(maxTokens, MAX_TOKENS_CAP)
        : MAX_TOKENS_CAP,
    ...(body.response_format ? { response_format: body.response_format } : {}),
  };

  // 按模型名前缀路由到对应厂商；密钥一律来自 Secrets，绝不硬编码
  const isZhipu = model.startsWith("glm-");
  const upstreamUrl = isZhipu ? ZHIPU_URL : DASHSCOPE_URL;
  const envName = isZhipu ? "ZHIPU_API_KEY" : "DASHSCOPE_API_KEY";
  const upstreamKey = Deno.env.get(envName) || "";

  if (!upstreamKey) {
    return jsonResp(
      {
        error: `服务端未配置 ${envName}，请在 Supabase 项目 Secrets 中设置后重新部署`,
      },
      500,
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${upstreamKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    return jsonResp(
      { error: `上游调用失败: ${(err as Error).message}` },
      502,
    );
  }

  // 原样透传上游响应，前端现有的 OpenAI 兼容解析逻辑无需改动
  const text = await upstream.text();
  return new Response(text, {
    status: upstream.status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
});
