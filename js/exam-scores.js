/* ============================================
   考试成绩查询模块
   2026年普通高等学校招生全国统一考试英语试卷（全国一卷）
   班级：18班 | 学生数：31 | 总分：150分
   ============================================ */

const ExamScores = {
    // 学生姓名 → 试卷图片 & 分数映射
    students: {
        '代湘语': { score: 101.5, id: '78369453', cls: '18班' },
        '王莉蓉': { score: 101.5, id: '78364855', cls: '18班' },
        '李瑞雪': { score: 102.5, id: '78361012', cls: '18班' },
        '刘欣语': { score: 105,   id: '78360526', cls: '18班' },
        '祝芷涵': { score: 106,   id: '78369248', cls: '18班' },
        '詹雅静': { score: 109,   id: '78354733', cls: '18班' },
        '喻文轩': { score: 111.5, id: '78369336', cls: '18班' },
        '梁紫禾': { score: 112,   id: '78367226', cls: '18班' },
        '周琳涵': { score: 114,   id: '78369303', cls: '18班' },
        '郑宜然': { score: 115,   id: '78369282', cls: '18班' },
        '敖雪婷': { score: 116.5, id: '78368881', cls: '18班' },
        '李子木': { score: 116.5, id: '78360506', cls: '18班' },
        '方嘉瑞': { score: 118,   id: '78364836', cls: '18班' },
        '沈馨蕾': { score: 119,   id: '78369340', cls: '18班' },
        '廖雨欣': { score: 120.5, id: '78367218', cls: '18班' },
        '王怡帆': { score: 121,   id: '78360530', cls: '18班' },
        '朱亚迪': { score: 52.5,  id: '78364867', cls: '18班' },
        '梅思雅': { score: 53.5,  id: '78360503', cls: '18班' },
        '胡友安': { score: 57.5,  id: '78363712', cls: '18班' },
        '刘禹辰': { score: 70.5,  id: '78368899', cls: '18班' },
        '刘梦琦': { score: 77,    id: '78369318', cls: '18班' },
        '商宇迪': { score: 92,    id: '78362469', cls: '18班' },
        '刘梦洁': { score: 93,    id: '78369276', cls: '18班' },
        '鲁慧妍': { score: 93,    id: '78367819', cls: '18班' },
        '陈曦曦': { score: 94.5,  id: '78360527', cls: '18班' },
        '童诗韵': { score: 95.5,  id: '78365851', cls: '18班' },
        '何思绮': { score: 96.5,  id: '78361006', cls: '18班' },
        '李嘉葉': { score: 98.5,  id: '78362454', cls: '18班' },
        '肖睿馨': { score: 98.5,  id: '78361005', cls: '18班' },
        '余欣怡': { score: 99.5,  id: '78364825', cls: '18班' },
        '雷文馨': { score: 99,    id: '78365879', cls: '18班' }
    },

    // 考试信息
    examInfo: {
        title: '2026年普通高等学校招生全国统一考试',
        subject: '英语试卷（全国一卷）',
        totalScore: 150,
        examDate: '2026年5月'
    },

    /* ---------- 根据 display_name 获取学生试卷 ---------- */
    getPapers(displayName) {
        const student = this.students[displayName];
        if (!student) return null;

        const basePath = 'img/exams/';
        return {
            name: displayName,
            score: student.score,
            studentId: student.id,
            className: student.cls,
            papers: [
                {
                    label: '试卷 - 第1页',
                    url: `${basePath}${student.score}_${displayName}_${student.id}(1).jpg`
                },
                {
                    label: '试卷 - 第2页',
                    url: `${basePath}${student.score}_${displayName}_${student.id}(2).jpg`
                }
            ],
            totalScore: this.examInfo.totalScore
        };
    },

    /* ---------- 获取所有学生成绩排名 ---------- */
    getRanking() {
        const list = Object.entries(this.students).map(([name, info]) => ({
            name,
            score: info.score,
            id: info.id
        }));
        list.sort((a, b) => b.score - a.score);
        // 加排名
        let rank = 0, prevScore = -1, sameCount = 0;
        return list.map((item, i) => {
            if (item.score !== prevScore) {
                rank = i + 1;
                sameCount = 0;
            } else {
                sameCount++;
            }
            prevScore = item.score;
            return { ...item, rank };
        });
    },

    /* ---------- 总体统计 ---------- */
    getStats() {
        const scores = Object.values(this.students).map(s => s.score);
        const total = scores.length;
        const avg = (scores.reduce((a, b) => a + b, 0) / total).toFixed(1);
        const max = Math.max(...scores);
        const min = Math.min(...scores);
        const passCount = scores.filter(s => s >= 90).length; // 150*0.6=90
        const excellentCount = scores.filter(s => s >= 120).length; // 150*0.8=120

        return {
            total,
            avg: parseFloat(avg),
            max,
            min,
            passCount,
            passRate: Math.round(passCount / total * 100),
            excellentCount,
            excellentRate: Math.round(excellentCount / total * 100)
        };
    },

    /* ---------- 初始化页面 ---------- */
    init() {
        // 确保已登录
        if (!SupabaseAuth.currentUser) {
            App.showPage('auth');
            return;
        }

        const displayName = SupabaseAuth.currentUser.display_name;
        const papers = this.getPapers(displayName);

        const emptyEl = document.getElementById('examEmpty');
        const contentEl = document.getElementById('examContent');
        const rankingEl = document.getElementById('examRanking');

        if (!papers) {
            // 没有匹配的试卷
            if (emptyEl) emptyEl.classList.remove('hidden');
            if (contentEl) contentEl.classList.add('hidden');
            if (rankingEl) rankingEl.classList.add('hidden');
            return;
        }

        // 显示试卷
        if (emptyEl) emptyEl.classList.add('hidden');
        if (contentEl) contentEl.classList.remove('hidden');
        if (rankingEl) rankingEl.classList.remove('hidden');

        // 填充学生信息
        document.getElementById('examStudentName').textContent = papers.name;
        document.getElementById('examStudentClass').textContent = papers.className;
        document.getElementById('examStudentId').textContent = '学号 ' + papers.studentId;
        document.getElementById('examScore').textContent = papers.score;
        document.getElementById('examTotalScore').textContent = papers.totalScore;

        // 渲染试卷图片
        const papersContainer = document.getElementById('examPapers');
        papersContainer.innerHTML = papers.papers.map((p, i) => `
            <div class="exam-paper-item" id="paper-${i}">
                <div class="exam-paper-header" onclick="ExamScores.togglePaper(${i})">
                    <span class="label"><i class="fas fa-image"></i> ${p.label}</span>
                    <span class="toggle-icon"><i class="fas fa-chevron-down"></i></span>
                </div>
                <div class="exam-paper-image" id="paper-img-${i}">
                    <img src="${p.url}" alt="${p.label}" loading="lazy"
                         onerror="this.parentElement.innerHTML='<div style=\\'padding:3rem;text-align:center;color:#94a3b8;\\'><i class=\\'fas fa-exclamation-triangle\\' style=\\'font-size:2rem;\\'></i><p style=\\'margin-top:0.5rem;\\'>图片加载失败</p></div>'">
                </div>
            </div>
        `).join('');

        // 展开第一张图
        setTimeout(() => this.togglePaper(0), 100);

        // 渲染排名
        this._renderRanking(papers);
    },

    /* ---------- 展开/折叠单张试卷 ---------- */
    togglePaper(index) {
        const imgEl = document.getElementById(`paper-img-${index}`);
        const paperEl = document.getElementById(`paper-${index}`);
        if (!imgEl || !paperEl) return;
        const headerEl = paperEl.querySelector('.exam-paper-header');

        const isOpen = imgEl.classList.contains('show');
        if (isOpen) {
            imgEl.classList.remove('show');
            if (headerEl) headerEl.classList.remove('open');
        } else {
            imgEl.classList.add('show');
            if (headerEl) headerEl.classList.add('open');
        }
    },

    /* ---------- 展开/折叠全部试卷 ---------- */
    toggleAllPapers() {
        const imgs = document.querySelectorAll('.exam-paper-image');
        const headers = document.querySelectorAll('.exam-paper-header');
        const btn = document.getElementById('examExpandBtn');

        const allOpen = Array.from(imgs).every(el => el.classList.contains('show'));

        if (allOpen) {
            imgs.forEach(el => el.classList.remove('show'));
            headers.forEach(el => el.classList.remove('open'));
            if (btn) btn.textContent = '展开全部图片';
        } else {
            imgs.forEach(el => el.classList.add('show'));
            headers.forEach(el => el.classList.add('open'));
            if (btn) btn.textContent = '折叠全部图片';
        }
    },

    /* ---------- 渲染班级排名 ---------- */
    _renderRanking(myInfo) {
        const stats = this.getStats();
        const ranking = this.getRanking();
        const myRank = ranking.find(r => r.name === myInfo.name);

        // 统计卡片
        document.getElementById('examStats').innerHTML = `
            <div class="exam-stat-item">
                <div class="exam-stat-val">${stats.total}</div>
                <div class="exam-stat-lbl">班级人数</div>
            </div>
            <div class="exam-stat-item">
                <div class="exam-stat-val">${stats.avg}</div>
                <div class="exam-stat-lbl">平均分</div>
            </div>
            <div class="exam-stat-item">
                <div class="exam-stat-val">${stats.max}</div>
                <div class="exam-stat-lbl">最高分</div>
            </div>
            <div class="exam-stat-item">
                <div class="exam-stat-val">${stats.passRate}%</div>
                <div class="exam-stat-lbl">及格率(≥90)</div>
            </div>
            <div class="exam-stat-item">
                <div class="exam-stat-val">${stats.excellentRate}%</div>
                <div class="exam-stat-lbl">优秀率(≥120)</div>
            </div>
        `;

        // 个人排名
        if (myRank) {
            document.getElementById('examMyRank').innerHTML = `
                <div class="rank-text">
                    <i class="fas fa-trophy"></i> 你的排名
                </div>
                <div class="rank-value">第 ${myRank.rank} 名 / ${stats.total} 人</div>
            `;
        }
    }
};
