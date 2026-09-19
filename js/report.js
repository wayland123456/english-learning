/* ============================================
   作文报告模块 — 生成 / 下载 Word / 分享链接
   v1 (2026-09-19)
   - 报告数据由 Writing / WritingAI 组装后传入 EssayReport
   - downloadDocx(): 懒加载 docx 库，现场生成 Word 下载
   - share(): 报告存 Supabase essay_reports 表，返回短链接
              表不存在/写入失败时，自动降级为「数据压缩进链接」
   - share.html 复用本模块渲染分享页
   ============================================ */

const EssayReport = {
    current: null, // 当前报告数据（评分完成后自动更新）

    DOCX_CDN: 'https://unpkg.com/docx@8.5.0/build/index.umd.js',

    /** 组装报告数据（writing 页面调用） */
    build(opts) {
        var essayText = (document.getElementById('writingTextarea') || {}).value || '';
        var prompt = (typeof DATA !== 'undefined' && DATA.writingPrompt) ? DATA.writingPrompt : {};
        var student = '同学';
        try {
            if (typeof SupabaseAuth !== 'undefined') {
                student = SupabaseAuth.currentUsername
                    || SupabaseAuth.currentUser && (SupabaseAuth.currentUser.username || SupabaseAuth.currentUser.email)
                    || '同学';
            }
        } catch (e) { /* ignore */ }

        var payload = {
            v: 1,
            kind: 'english-essay',
            createdAt: new Date().toISOString(),
            student: String(student),
            title: prompt.title || '高考应用文写作',
            promptText: prompt.prompt ? String(prompt.prompt).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '',
            essay: essayText.trim(),
            mode: opts.mode,
            ai: opts.ai || null,
            rule: opts.rule || null
        };
        this.current = payload;
        return payload;
    },

    /* ================= Word 下载 ================= */

    downloadDocx(payload) {
        var self = this;
        payload = payload || this.current;
        if (!payload) { alert('请先完成评分'); return; }
        if (typeof App !== 'undefined' && App.toast) App.toast('正在生成 Word 报告...', 'info');

        this._loadDocx(function () {
            try {
                var blob = self._buildDocxBlob(payload);
                var dateStr = payload.createdAt.substring(0, 10);
                var name = (payload.student || '学生') + '_作文报告_' + payload.totalScoreForFile + '分_' + dateStr + '.docx';
                var a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = name;
                document.body.appendChild(a);
                a.click();
                setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
                if (typeof App !== 'undefined' && App.toast) App.toast('✅ Word 报告已下载', 'success');
            } catch (e) {
                console.error('[EssayReport] 生成 Word 失败:', e);
                alert('生成 Word 失败：' + (e.message || e));
            }
        });
    },

    _loadDocx(cb) {
        if (window.docx) return cb();
        var s = document.createElement('script');
        s.src = this.DOCX_CDN;
        s.onload = function () { cb(); };
        s.onerror = function () { alert('Word 组件加载失败，请检查网络后重试'); };
        document.head.appendChild(s);
    },

    _buildDocxBlob(payload) {
        var D = window.docx;
        var children = [];

        // 标题
        children.push(new D.Paragraph({
            text: '英语作文智能批改报告',
            heading: D.HeadingLevel.HEADING_1,
            alignment: D.AlignmentType.CENTER,
            spacing: { after: 200 }
        }));

        // 元信息
        var metaInfo = '学生：' + payload.student + '    批改时间：' + payload.createdAt.substring(0, 10)
            + '    批改方式：' + (payload.mode === 'ai' ? 'AI 智能评分' : '规则评分');
        children.push(new D.Paragraph({
            children: [new D.TextRun({ text: metaInfo, size: 20, color: '666666' })],
            alignment: D.AlignmentType.CENTER,
            spacing: { after: 300 }
        }));

        // 题目
        if (payload.title) {
            children.push(new D.Paragraph({ text: '题目：' + payload.title, spacing: { after: 80 } }));
        }
        if (payload.promptText) {
            children.push(new D.Paragraph({
                children: [new D.TextRun({ text: payload.promptText, size: 20, color: '555555', italics: true })],
                spacing: { after: 200 }
            }));
        }

        // 总分
        var total = payload.mode === 'ai' && payload.ai ? payload.ai.totalScore
            : payload.rule ? payload.rule.total : null;
        payload.totalScoreForFile = total != null ? total : 0;
        if (total != null) {
            var level = payload.mode === 'ai'
                ? (total >= 13 ? '优秀' : total >= 10 ? '良好' : total >= 7 ? '一般' : '需努力') : '';
            children.push(new D.Paragraph({
                children: [
                    new D.TextRun({ text: '总分：', size: 32 }),
                    new D.TextRun({ text: String(total), size: 48, bold: true, color: 'F59E0B' }),
                    new D.TextRun({ text: ' / 15', size: 32, color: '999999' }),
                    level ? new D.TextRun({ text: '    （' + level + '）', size: 24, color: 'F59E0B' }) : new D.TextRun('')
                ],
                alignment: D.AlignmentType.CENTER,
                spacing: { before: 200, after: 300 }
            }));
        }

        // AI 维度
        if (payload.ai && payload.ai.dimensions) {
            var names = { content: '内容要点(5分)', language: '语言表达(5分)', structure: '篇章结构(3分)', innovation: '创新亮点(2分)' };
            children.push(new D.Paragraph({ text: '一、分项评分', heading: D.HeadingLevel.HEADING_2, spacing: { after: 100 } }));
            var keys = ['content', 'language', 'structure', 'innovation'];
            for (var i = 0; i < keys.length; i++) {
                var d = payload.ai.dimensions[keys[i]];
                if (!d) continue;
                children.push(new D.Paragraph({
                    children: [
                        new D.TextRun({ text: names[keys[i]] + '：', bold: true, size: 24 }),
                        new D.TextRun({ text: d.score + ' 分', bold: true, color: '1E3A8A', size: 24 })
                    ],
                    spacing: { before: 120, after: 60 }
                }));
                children.push(new D.Paragraph({
                    children: [new D.TextRun({ text: d.comment || '', size: 22 })],
                    spacing: { after: 120 }
                }));
            }
        }

        // AI 总评
        if (payload.ai && payload.ai.overallComment) {
            children.push(new D.Paragraph({ text: '二、总体评价', heading: D.HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
            children.push(new D.Paragraph({
                children: [new D.TextRun({ text: payload.ai.overallComment, size: 22 })],
                spacing: { after: 200 }
            }));
        }

        // 纠错
        if (payload.ai && payload.ai.corrections && payload.ai.corrections.length) {
            children.push(new D.Paragraph({ text: '三、具体纠错', heading: D.HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
            var typeNames = { grammar: '语法', word: '用词', structure: '结构' };
            payload.ai.corrections.forEach(function (c, idx) {
                children.push(new D.Paragraph({
                    children: [new D.TextRun({ text: '纠错 ' + (idx + 1) + '（' + (typeNames[c.type] || '其他') + '）', bold: true, color: '1E3A8A', size: 24 })],
                    spacing: { before: 150, after: 80 }
                }));
                children.push(new D.Paragraph({
                    children: [
                        new D.TextRun({ text: '【原文】', bold: true, color: 'DC2626', size: 20 }),
                        new D.TextRun({ text: c.original || '', size: 22 })
                    ],
                    indent: { left: 200 }, spacing: { after: 60 }
                }));
                children.push(new D.Paragraph({
                    children: [
                        new D.TextRun({ text: '【修改】', bold: true, color: '059669', size: 20 }),
                        new D.TextRun({ text: c.corrected || '', size: 22 })
                    ],
                    indent: { left: 200 }, spacing: { after: 60 }
                }));
                if (c.explanation) {
                    children.push(new D.Paragraph({
                        children: [new D.TextRun({ text: c.explanation, size: 20, color: '555555' })],
                        indent: { left: 200 }, spacing: { after: 120 }
                    }));
                }
            });
        }

        // 亮点
        if (payload.ai && payload.ai.highlights && payload.ai.highlights.length) {
            children.push(new D.Paragraph({ text: '四、亮点表达', heading: D.HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
            payload.ai.highlights.forEach(function (h) {
                children.push(new D.Paragraph({
                    children: [new D.TextRun({ text: '★ ' + h, size: 22 })],
                    spacing: { after: 60 }
                }));
            });
        }

        // 建议
        if (payload.ai && payload.ai.suggestions && payload.ai.suggestions.length) {
            children.push(new D.Paragraph({ text: '五、提升建议', heading: D.HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
            payload.ai.suggestions.forEach(function (s, i) {
                children.push(new D.Paragraph({
                    children: [new D.TextRun({ text: (i + 1) + '. ' + s, size: 22 })],
                    spacing: { after: 60 }
                }));
            });
        }

        // 规则评分兜底（无 AI 结果时展示）
        if (!payload.ai && payload.rule) {
            children.push(new D.Paragraph({ text: '一、规则评分结果', heading: D.HeadingLevel.HEADING_2, spacing: { after: 100 } }));
            children.push(new D.Paragraph({
                children: [new D.TextRun({ text: '内容要点 ' + payload.rule.content + '/5，语言表达 ' + payload.rule.language + '/5，篇章结构 ' + payload.rule.coherence + '/3，创新亮点 ' + payload.rule.innovation + '/2', size: 22 })],
                spacing: { after: 120 }
            }));
            (payload.rule.feedback || []).forEach(function (f) {
                children.push(new D.Paragraph({
                    children: [new D.TextRun({ text: '• ' + f, size: 22 })],
                    spacing: { after: 60 }
                }));
            });
        }

        // 作文原文
        children.push(new D.Paragraph({ text: '附：作文原文', heading: D.HeadingLevel.HEADING_2, spacing: { before: 300, after: 100 } }));
        var paras = (payload.essay || '').split(/\n+/);
        for (var p = 0; p < paras.length; p++) {
            if (!paras[p].trim()) continue;
            children.push(new D.Paragraph({
                children: [new D.TextRun({ text: paras[p].trim(), size: 22, font: 'Times New Roman' })],
                spacing: { after: 120, line: 360 }
            }));
        }

        var doc = new D.Document({
            sections: [{ properties: {}, children: children }],
            creator: '英语自主研学平台',
            title: '英语作文智能批改报告'
        });
        return D.Packer.toBlob(doc);
    },

    /* ================= 分享 ================= */

    // 生成 8 位短 ID（去掉易混淆字符）
    _genId() {
        var chars = '23456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz';
        var arr = crypto.getRandomValues(new Uint8Array(8));
        var s = '';
        for (var i = 0; i < 8; i++) s += chars[arr[i] % chars.length];
        return s;
    },

    async share(payload) {
        payload = payload || this.current;
        if (!payload) {
            if (typeof App !== 'undefined' && App.toast) App.toast('请先完成评分再分享', 'info');
            return;
        }
        var btn = document.getElementById('btnShareReport');
        var self = this;
        if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 生成链接中...'; }

        var link = null;
        try {
            // 通道1：存 Supabase essay_reports 表（短链接）
            var id = this._genId();
            var resp = await fetch(SUPABASE_URL + '/rest/v1/essay_reports', {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({ id: id, data: payload })
            });
            if (!resp.ok) {
                var errText = '';
                try { errText = await resp.text(); } catch (e) {}
                throw new Error('存储失败 HTTP ' + resp.status + (errText ? ' ' + errText.substring(0, 120) : ''));
            }
            link = this._shareBase() + 'share.html?r=' + id;
        } catch (e) {
            console.warn('[EssayReport] Supabase 存储失败，降级为链接内嵌数据：', e.message || e);
            // 通道2（降级）：数据压缩进链接，不依赖后台
            try {
                var packed = await this._packData(payload);
                if (!packed) throw new Error('链接数据打包失败');
                link = this._shareBase() + 'share.html#d=' + packed;
            } catch (e2) {
                console.error('[EssayReport] 分享失败:', e2);
                if (typeof App !== 'undefined' && App.toast) App.toast('分享失败：' + (e2.message || e2), 'error');
            }
        } finally {
            if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-share-alt"></i> 分享报告'; }
        }

        if (!link) return;

        // 链接过长提示（微信等场景可能截断，但现代浏览器一般可用）
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(link);
                if (typeof App !== 'undefined' && App.toast) {
                    App.toast(link.length > 8000
                        ? '✅ 报告链接已复制（较长，建议用浏览器打开）'
                        : '✅ 报告链接已复制，发给同学/老师即可查看', 'success');
                }
            } else {
                prompt('复制以下链接分享：', link);
            }
        } catch (e) {
            prompt('复制以下链接分享：', link);
        }
    },

    // 分享页基础地址（同目录下 share.html）
    _shareBase() {
        var base;
        try {
            base = location.origin + location.pathname.replace(/[^/]*$/, '');
            if (location.origin === 'null' || !location.origin) base = location.pathname.replace(/[^/]*$/, '');
        } catch (e) {
            base = location.pathname.replace(/[^/]*$/, '');
        }
        return base;
    },

    // 数据打包进链接：优先 gzip 压缩（原生 CompressionStream），不支持则退化为纯 base64
    async _packData(payload) {
        var json = JSON.stringify(payload);
        var b64url = null;
        if (typeof CompressionStream !== 'undefined') {
            try {
                var cs = new CompressionStream('deflate-raw');
                var stream = new Blob([json]).stream().pipeThrough(cs);
                var buf = new Uint8Array(await new Response(stream).arrayBuffer());
                var bin = '';
                for (var i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
                b64url = btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
                return 'z' + b64url; // z 前缀 = gzip 压缩
            } catch (e) { /* fallthrough */ }
        }
        // 未压缩 base64（encodeURIComponent 保中文安全，url-safe 化）
        b64url = btoa(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        return 'p' + b64url; // p 前缀 = 原始打包
    }
};

/* ============ share.html 专用：解析链接并渲染报告 ============ */

async function loadSharedEssayReport() {
    // 通道1：?r=<短ID> → Supabase 查询
    var m = location.search.match(/[?&]r=([A-Za-z0-9]+)/);
    if (m) {
        try {
            var resp = await fetch(SUPABASE_URL + '/rest/v1/essay_reports?id=eq.' + encodeURIComponent(m[1]) + '&select=data', {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
                }
            });
            var json = await resp.json();
            if (resp.ok && json && json.length > 0 && json[0].data) {
                return json[0].data;
            }
            throw new Error(json && json.message ? json.message : '报告不存在或已失效');
        } catch (e) {
            document.getElementById('shareLoading').innerHTML =
                '<div class="err">⚠️ 报告读取失败：' + (e.message || e) + '</div>';
            return null;
        }
    }

    // 通道2：#d=<数据> → 本地解析
    var h = location.hash.match(/[#&]d=([A-Za-z0-9\-_]+)/);
    if (h) {
        var raw = h[1];
        try {
            var b64 = raw.substring(1).replace(/-/g, '+').replace(/_/g, '/');
            while (b64.length % 4) b64 += '=';
            var jsonStr;
            if (raw[0] === 'z' && typeof DecompressionStream !== 'undefined') {
                var bin = atob(b64);
                var u8 = new Uint8Array(bin.length);
                for (var i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
                var ds = new DecompressionStream('deflate-raw');
                var stream = new Blob([u8]).stream().pipeThrough(ds);
                jsonStr = await new Response(stream).text();
            } else {
                jsonStr = decodeURIComponent(escape(atob(b64)));
            }
            return JSON.parse(jsonStr);
        } catch (e) {
            document.getElementById('shareLoading').innerHTML =
                '<div class="err">⚠️ 报告链接无效或已损坏</div>';
            return null;
        }
    }
    return null;
}

function renderEssayReportPage(data) {
    if (!data) {
        document.getElementById('shareLoading').innerHTML =
            '<div class="err">未找到报告数据。请确认链接是否完整。</div>';
        return;
    }
    EssayReport.current = data;
    var isAI = data.mode === 'ai' && data.ai;
    var total = isAI ? data.ai.totalScore : (data.rule ? data.rule.total : null);
    var level = '', levelColor = '#6366f1';
    if (isAI) {
        if (total >= 13) { level = '优秀'; levelColor = '#10b981'; }
        else if (total >= 10) { level = '良好'; levelColor = '#6366f1'; }
        else if (total >= 7) { level = '一般'; levelColor = '#f59e0b'; }
        else { level = '需努力'; levelColor = '#ef4444'; }
    }

    var html = '';
    html += '<div class="rep-head">';
    html += '  <h1>📄 英语作文智能批改报告</h1>';
    html += '  <div class="rep-meta">' + esc(data.student) + ' · ' + esc(data.title) + ' · ' + data.createdAt.substring(0, 10)
         + ' · ' + (isAI ? 'AI 智能评分' : '规则评分') + '</div>';
    html += '</div>';

    if (data.promptText) {
        html += '<div class="rep-prompt">' + esc(data.promptText) + '</div>';
    }

    if (total != null) {
        html += '<div class="rep-total">'
            + '<span class="rep-total-num" style="color:' + levelColor + ';">' + total + '</span>'
            + '<span class="rep-total-max">/ 15</span>'
            + (level ? '<span class="rep-level" style="color:' + levelColor + ';border-color:' + levelColor + ';">' + level + '</span>' : '')
            + '</div>';
    }

    // 维度条
    if (isAI) {
        var names = { content: '内容要点', language: '语言表达', structure: '篇章结构', innovation: '创新亮点' };
        var maxes = { content: 5, language: 5, structure: 3, innovation: 2 };
        var keys = ['content', 'language', 'structure', 'innovation'];
        html += '<div class="rep-dims">';
        for (var i = 0; i < keys.length; i++) {
            var d = data.ai.dimensions[keys[i]] || { score: 0, comment: '' };
            var pct = Math.round(d.score / maxes[keys[i]] * 100);
            var color = pct >= 80 ? '#10b981' : pct >= 50 ? '#6366f1' : '#f59e0b';
            html += '<div class="rep-dim">'
                + '<div class="rep-dim-h"><span>' + names[keys[i]] + '</span><b style="color:' + color + ';">' + d.score + ' / ' + maxes[keys[i]] + '</b></div>'
                + '<div class="rep-bar"><div class="rep-bar-fill" style="width:' + pct + '%;background:' + color + ';"></div></div>'
                + '<div class="rep-dim-c">' + esc(d.comment || '') + '</div>'
                + '</div>';
        }
        html += '</div>';
    } else if (data.rule) {
        html += '<div class="rep-dims">'
            + '<div class="rep-dim"><div class="rep-dim-h"><span>内容要点</span><b>' + data.rule.content + ' / 5</b></div></div>'
            + '<div class="rep-dim"><div class="rep-dim-h"><span>语言表达</span><b>' + data.rule.language + ' / 5</b></div></div>'
            + '<div class="rep-dim"><div class="rep-dim-h"><span>篇章结构</span><b>' + data.rule.coherence + ' / 3</b></div></div>'
            + '<div class="rep-dim"><div class="rep-dim-h"><span>创新亮点</span><b>' + data.rule.innovation + ' / 2</b></div></div>'
            + '</div>';
    }

    if (isAI && data.ai.overallComment) {
        html += '<div class="rep-section"><h3>💬 总体评价</h3><p>' + esc(data.ai.overallComment) + '</p></div>';
    }

    if (isAI && data.ai.corrections && data.ai.corrections.length) {
        var tnames = { grammar: '语法', word: '用词', structure: '结构' };
        html += '<div class="rep-section"><h3>✏️ 具体纠错</h3>';
        data.ai.corrections.forEach(function (c) {
            html += '<div class="rep-corr">'
                + '<span class="rep-tag">' + (tnames[c.type] || '其他') + '</span>'
                + '<div class="rep-corr-line bad"><b>原文</b> ' + esc(c.original) + '</div>'
                + '<div class="rep-corr-line good"><b>修改</b> ' + esc(c.corrected) + '</div>'
                + (c.explanation ? '<div class="rep-corr-exp">' + esc(c.explanation) + '</div>' : '')
                + '</div>';
        });
        html += '</div>';
    }

    if (isAI && data.ai.highlights && data.ai.highlights.length) {
        html += '<div class="rep-section"><h3>⭐ 亮点表达</h3><ul>';
        data.ai.highlights.forEach(function (h) { html += '<li>' + esc(h) + '</li>'; });
        html += '</ul></div>';
    }

    if (isAI && data.ai.suggestions && data.ai.suggestions.length) {
        html += '<div class="rep-section"><h3>💡 提升建议</h3><ol>';
        data.ai.suggestions.forEach(function (s) { html += '<li>' + esc(s) + '</li>'; });
        html += '</ol></div>';
    }

    if (!isAI && data.rule && data.rule.feedback) {
        html += '<div class="rep-section"><h3>💡 修改建议</h3><ul>';
        data.rule.feedback.forEach(function (f) { html += '<li>' + esc(f) + '</li>'; });
        html += '</ul></div>';
    }

    html += '<div class="rep-section rep-essay"><h3>📝 作文原文</h3>';
    (data.essay || '').split(/\n+/).forEach(function (p) {
        if (p.trim()) html += '<p class="rep-essay-p">' + esc(p.trim()) + '</p>';
    });
    html += '</div>';

    html += '<div class="rep-footer">英语自主研学平台 · AI 智能批改 · 生成于 ' + data.createdAt.substring(0, 10) + '</div>';

    document.getElementById('shareReport').innerHTML = html;
    document.getElementById('shareLoading').classList.add('hidden');
    document.getElementById('shareActions').classList.remove('hidden');
    document.title = data.student + ' 的英语作文报告';
}

function esc(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
