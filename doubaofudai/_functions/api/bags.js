// 跨域头配置
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
};

// 鉴权密钥，必须和index.html里的完全一致
const API_KEY = "qq123456";

// 主函数
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // 处理浏览器预检请求
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // 鉴权校验
  const requestKey = request.headers.get("X-API-Key");
  if (requestKey !== API_KEY) {
    return new Response(JSON.stringify({ success: false, msg: "鉴权失败" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // 获取设备ID
  const deviceId = url.searchParams.get("deviceId");
  if (!deviceId) {
    return new Response(JSON.stringify({ success: false, msg: "缺少deviceId" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // GET请求：获取福袋数据
  if (request.method === "GET") {
    const data = await env.DOUYIN_BAGS_KV.get(deviceId);
    return new Response(JSON.stringify({
      success: true,
      data: data ? JSON.parse(data) : []
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // POST请求：保存福袋数据
  if (request.method === "POST") {
    const body = await request.json();
    await env.DOUYIN_BAGS_KV.put(deviceId, JSON.stringify(body.bags));
    return new Response(JSON.stringify({ success: true, msg: "保存成功" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // 不支持的请求
  return new Response(JSON.stringify({ success: false, msg: "不支持的请求方法" }), {
    status: 405,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}