/* ============================================
   Supabase 配置文件
   ============================================ */
const SUPABASE_URL = 'https://gqlwspxcyhjtzhikcexj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_PqN5m9yOrWZzBazFjO7Y_w_pfIMO1PI';

// 初始化 Supabase 客户端（用 db 命名避免和 window.supabase SDK 冲突）
let db;
try {
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('[Supabase] 初始化成功');
    } else {
        console.error('[Supabase] SDK 未加载！请检查 CDN 引用');
    }
} catch (e) {
    console.error('[Supabase] 初始化失败：', e);
}
