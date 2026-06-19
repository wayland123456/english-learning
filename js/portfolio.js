/* ============================================
   第三层学习成果：旅行攻略 + 旅行日记
   全部选择题驱动，零写作负担
   ============================================ */

const Portfolio = {

    /* ========== 数据定义 ========== */
    FOODS: {
        uk: ['Fish and Chips', 'Afternoon Tea', 'Full English Breakfast', 'Steak and Kidney Pie', 'Scones with Cream'],
        usa: ['Hamburger', 'Hot Dog', 'Mac and Cheese', 'BBQ Ribs', 'Apple Pie'],
        australia: ['Meat Pie', 'Vegemite Toast', 'Lamingtons', 'Pavlova', 'BBQ Sausage'],
        canada: ['Poutine', 'Maple Syrup Pancakes', 'Butter Tarts', 'Nanaimo Bars', 'BeaverTails'],
        ireland: ['Irish Stew', 'Soda Bread', 'Colcannon', 'Boxty Potato Pancakes', 'Seafood Chowder'],
        newzealand: ['Hangi', 'Pavlova', 'Fish and Chips', 'Meat Pie', 'Whitebait Fritters']
    },

    ACTIVITIES: [
        'visited famous landmarks',
        'took beautiful photos',
        'tried local food',
        'met friendly local people',
        'went on a guided tour',
        'explored the city on foot',
        'took a boat trip',
        'visited a museum',
        'relaxed at the beach',
        'went hiking in nature',
        'watched a live performance',
        'bought souvenirs',
        'learned about local history',
        'tasted delicious street food',
        'went to a local market'
    ],

    WEATHER: ['sunny', 'cloudy', 'rainy', 'windy', 'snowy', 'stormy', 'foggy', 'partly cloudy'],
    WEATHER_EMOJI: { sunny: '\u2600\ufe0f', cloudy: '\u2601\ufe0f', rainy: '\ud83c\udf27\ufe0f', windy: '\ud83d\udca8', snowy: '\u2744\ufe0f', stormy: '\u26c8\ufe0f', foggy: '\ud83c\udf2b\ufe0f', 'partly cloudy': '\u26c5' },

    MOOD: ['excited', 'happy', 'tired', 'amazed', 'curious', 'relaxed', 'adventurous', 'grateful'],
    MOOD_EMOJI: { excited: '\ud83e\udd29', happy: '\ud83d\ude0a', tired: '\ud83d\ude34', amazed: '\ud83e\udd2f', curious: '\ud83e\uddd0', relaxed: '\ud83d\ude0c', adventurous: '\ud83e\uddd7', grateful: '\ud83d\ude4f' },

    GIFTS: ['Mum', 'Dad', 'Best friend', 'Brother/Sister', 'Grandma/Grandpa', 'Teacher', 'Myself'],

    /* ========== 获取已学词汇（从进度中） ========== */
    getLearnedVocab() {
        var progress = {};
        try {
            if (typeof SupabaseAuth !== 'undefined' && SupabaseAuth.getProgress) {
                progress = SupabaseAuth.getProgress() || {};
            }
        } catch(e) { progress = {}; }
        var words = [];
        if (progress.vocabulary && progress.vocabulary.length > 0) {
            words = progress.vocabulary.slice(0, 10);
        }
        // Also try to extract from resources
        if (progress.resources && progress.resources.length > 0) {
            progress.resources.forEach(function(resId) {
                var vocab = this._getVocabForResource(resId);
                vocab.forEach(function(v) {
                    if (words.indexOf(v) === -1) words.push(v);
                });
            }.bind(this));
        }
        return words.slice(0, 12);
    },

    _getVocabForResource(resId) {
        // resId format: "uk-0" = country-attraction index
        var parts = resId.split('-');
        var country = DATA.resources.find(function(c) { return c.id === parts[0]; });
        if (!country) return [];
        var attrIdx = parseInt(parts[1]);
        var attr = country.attractions[attrIdx];
        if (!attr) return [];
        return attr.vocabulary.map(function(v) { return v.word; });
    },

    /* ========== 旅行攻略 ========== */
    guide: {
        init() {
            var container = document.getElementById('guideContainer');
            var myGuides = Portfolio._loadLocal('travel_guides') || [];
            container.innerHTML = Portfolio.guide._renderList(myGuides);
            Portfolio.guide._bindListEvents();
        },

        _renderList(guides) {
            var html = '<div class="page-header portfolio-header" style="background:linear-gradient(135deg,#667eea 0%,#764ba2 50%,#f093fb 100%)"><div class="page-header-overlay"></div><div class="page-header-content"><h1><span style="font-size:1.3rem;margin-right:0.3rem;">🗺️</span> 我的旅行攻略</h1><p style="margin-top:0.4rem;font-size:0.92rem;opacity:0.9;">勾选你喜欢的选项，一键生成专属英文旅行攻略！</p></div></div>';
            html += '<div class="page-body"><div class="portfolio-section">';

            if (guides.length > 0) {
                html += '<h3 class="portfolio-subtitle">📋 已创建的攻略 <span style="font-size:0.78rem;color:var(--text-light);font-weight:400;">(' + guides.length + ' 篇)</span></h3><div class="portfolio-card-list">';
                guides.forEach(function(g, i) {
                    var country = DATA.resources.find(function(c) { return c.id === g.country_id; });
                    var countryCN = country ? country.countryCN : g.country_id;
                    var flag = country ? country.flag : '🌍';
                    var attrCount = g.attractions ? g.attractions.length : 0;
                    var dateStr = new Date(g.created_at).toLocaleDateString('zh-CN', {month:'short',day:'numeric'});
                    html += '<div class="portfolio-card" onclick="Portfolio.guide.view(' + i + ')">';
                    html += '<div class="portfolio-card-icon" style="font-size:1.8rem;background:linear-gradient(135deg,rgba(102,126,234,0.08),rgba(118,75,162,0.08));padding:0.6rem;border-radius:12px;">' + flag + '</div>';
                    html += '<div class="portfolio-card-info"><div class="portfolio-card-title">' + flag + ' ' + countryCN + ' Travel Guide</div>';
                    html += '<div class="portfolio-card-meta">📍 ' + attrCount + ' 个景点 · 📅 ' + dateStr + '</div>';
                    // 进度指示条
                    var progress = Math.min(100, Math.round((attrCount / 5) * 100));
                    html += '<div style="display:flex;align-items:center;gap:6px;margin-top:6px;"><div style="flex:1;height:3px;background:var(--border);border-radius:2px;overflow:hidden;"><div style="width:' + progress + '%;height:100%;background:linear-gradient(90deg,var(--primary),#764ba2);border-radius:2px;"></div></div><span style="font-size:0.62rem;color:var(--text-light);">' + progress + '%</span></div>';
                    html += '</div><div class="portfolio-card-arrow" style="background:rgba(99,102,241,0.06);color:var(--primary);width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;"><i class="fas fa-chevron-right"></i></div></div>';
                });
                html += '</div>';
            } else {
                // 空状态 — 引导创建
                html += '<div class="sb-empty" style="padding-top:1rem;"><div class="sb-empty-adventure" style="max-width:280px;">';
                html += '<div style="font-size:3.5rem;margin-bottom:0.8rem;">🗺️</div>';
                html += '<h3>还没有旅行攻略</h3>';
                html += '<p>选择目的地、景点、美食和英语短语，一键生成你的专属攻略！</p>';
                html += '<div class="sb-empty-hint-tags" style="justify-content:center;">';
                html += '<span class="sb-empty-tag">🎯 选景点</span>';
                html += '<span class="sb-empty-tag">🍽️ 选美食</span>';
                html += '<span class="sb-empty-tag">💬 选英语</span>';
                html += '<span class="sb-empty-tag">✨ 自动生成</span>';
                html += '</div></div></div>';
            }

            html += '<button class="portfolio-create-btn" onclick="Portfolio.guide.create()"><i class="fas fa-plus-circle"></i> ✨ 创建新攻略</button>';
            html += '</div></div>';
            return html;
        },

        _bindListEvents() {},

        create() {
            var container = document.getElementById('guideContainer');
            container.innerHTML = Portfolio.guide._renderBuilder();
            Portfolio.guide._bindBuilderEvents();
        },

        _renderBuilder() {
            var html = '<div class="pf-header-small"><button class="pf-back-btn" onclick="Portfolio.guide.init()"><i class="fas fa-arrow-left"></i> 返回</button><h2>创建新攻略</h2></div>';
            html += '<div class="pf-form">';

            // Step 1: Country
            html += '<div class="pf-step"><div class="pf-step-title"><span class="pf-step-num">1</span> 选择目的地</div><div class="pf-option-grid" id="guideCountryOptions">';
            DATA.resources.forEach(function(c) {
                html += '<label class="pf-option-card pf-option-lg" data-country="' + c.id + '"><input type="radio" name="guideCountry" value="' + c.id + '"><span class="pf-option-flag">' + c.flag + '</span><span class="pf-option-label">' + c.country + '</span></label>';
            });
            html += '</div></div>';

            // Step 2: Attractions
            html += '<div class="pf-step hidden" id="guideStepAttractions"><div class="pf-step-title"><span class="pf-step-num">2</span> 想去哪些景点？</div><div class="pf-option-grid" id="guideAttrOptions"></div></div>';

            // Step 3: Phrases
            html += '<div class="pf-step hidden" id="guideStepPhrases"><div class="pf-step-title"><span class="pf-step-num">3</span> 在旅途中你会用到哪些英语？</div><div class="pf-option-list" id="guidePhraseOptions"></div></div>';

            // Step 4: Foods
            html += '<div class="pf-step hidden" id="guideStepFoods"><div class="pf-step-title"><span class="pf-step-num">4</span> 想品尝什么美食？</div><div class="pf-option-grid" id="guideFoodOptions"></div></div>';

            // Step 5: Gifts
            html += '<div class="pf-step hidden" id="guideStepGifts"><div class="pf-step-title"><span class="pf-step-num">5</span> 想给谁带礼物？</div><div class="pf-option-grid" id="guideGiftOptions"></div></div>';

            // Generate button
            html += '<div class="pf-step hidden" id="guideStepGenerate"><button class="pf-generate-btn" onclick="Portfolio.guide.generate()"><i class="fas fa-magic"></i> 一键生成我的攻略！</button></div>';

            html += '</div>';
            return html;
        },

        _bindBuilderEvents() {
            // Country change -> show attractions
            var countryRadios = document.querySelectorAll('input[name="guideCountry"]');
            countryRadios.forEach(function(radio) {
                radio.addEventListener('change', function() {
                    Portfolio.guide._onCountrySelect(this.value);
                });
            });

            // Show phrases initially
            var phraseList = document.getElementById('guidePhraseOptions');
            if (phraseList) {
                phraseList.innerHTML = Portfolio.guide._renderPhraseOptions();
            }

            // Show foods for default selection
            // Show gifts initially
            var giftOptions = document.getElementById('guideGiftOptions');
            if (giftOptions) {
                giftOptions.innerHTML = Portfolio.guide._renderGiftOptions();
            }
        },

        _onCountrySelect(countryId) {
            // Show all steps
            document.getElementById('guideStepAttractions').classList.remove('hidden');
            document.getElementById('guideStepPhrases').classList.remove('hidden');
            document.getElementById('guideStepFoods').classList.remove('hidden');
            document.getElementById('guideStepGifts').classList.remove('hidden');
            document.getElementById('guideStepGenerate').classList.remove('hidden');

            // Populate attractions
            var country = DATA.resources.find(function(c) { return c.id === countryId; });
            var attrHtml = '';
            if (country) {
                country.attractions.forEach(function(a) {
                    attrHtml += '<label class="pf-option-card pf-option-md"><input type="checkbox" name="guideAttr" value="' + Portfolio._escape(a.title) + '"><span class="pf-option-title">' + a.title + '</span><span class="pf-option-desc">' + a.location + '</span></label>';
                });
            }
            document.getElementById('guideAttrOptions').innerHTML = attrHtml;

            // Update foods
            var foods = Portfolio.FOODS[countryId] || [];
            var foodHtml = '';
            foods.forEach(function(f) {
                foodHtml += '<label class="pf-option-card pf-option-sm"><input type="checkbox" name="guideFood" value="' + Portfolio._escape(f) + '"><span class="pf-option-label">' + f + '</span></label>';
            });
            document.getElementById('guideFoodOptions').innerHTML = foodHtml;
        },

        _renderPhraseOptions() {
            var html = '';
            var selected = Portfolio._pickRandom(DATA.speakingSentences.map(function(s) { return s.english; }), 8);
            selected.forEach(function(p) {
                html += '<label class="pf-option-row"><input type="checkbox" name="guidePhrase" value="' + Portfolio._escape(p) + '"><span>' + p + '</span></label>';
            });
            return html;
        },

        _renderGiftOptions() {
            var html = '';
            Portfolio.GIFTS.forEach(function(g) {
                html += '<label class="pf-option-card pf-option-sm"><input type="checkbox" name="guideGift" value="' + Portfolio._escape(g) + '"><span class="pf-option-label">' + g + '</span></label>';
            });
            return html;
        },

        generate() {
            var countryRadio = document.querySelector('input[name="guideCountry"]:checked');
            if (!countryRadio) { App.toast('请先选择目的地', 'error'); return; }

            var countryId = countryRadio.value;
            var country = DATA.resources.find(function(c) { return c.id === countryId; });

            var attrs = Portfolio._getChecked('guideAttr');
            var phrases = Portfolio._getChecked('guidePhrase');
            var foods = Portfolio._getChecked('guideFood');
            var gifts = Portfolio._getChecked('guideGift');

            if (attrs.length === 0) { App.toast('请至少选一个景点', 'error'); return; }

            // Build result
            var guide = {
                country_id: countryId,
                country: country ? country.country : countryId,
                countryCN: country ? country.countryCN : countryId,
                flag: country ? country.flag : '',
                attractions: attrs,
                phrases: phrases,
                foods: foods,
                gifts: gifts,
                created_at: new Date().toISOString()
            };

            // Save
            var guides = Portfolio._loadLocal('travel_guides') || [];
            guides.push(guide);
            Portfolio._saveLocal('travel_guides', guides);
            Portfolio._syncGuideToCloud(guide);

            // Show result
            var container = document.getElementById('guideContainer');
            container.innerHTML = Portfolio.guide._renderResult(guide, guides.length - 1);
            App.toast('攻略生成成功！', 'success');
        },

        _renderResult(guide, index) {
            var html = '<div class="pf-header-small"><button class="pf-back-btn" onclick="Portfolio.guide.init()"><i class="fas fa-arrow-left"></i> 返回列表</button><h2>' + (guide.flag || '🌍') + ' ' + (guide.countryCN || guide.country) + ' Travel Guide</h2></div>';
            html += '<div class="guide-result">';

            // Title Hero — 增强版
            html += '<div class="guide-result-hero">';
            html += '<span style="font-size:2.8rem;display:block;margin-bottom:0.4rem;">' + (guide.flag || '🌍') + '</span>';
            html += '<h1>My Travel Guide to ' + (guide.country || '') + '</h1>';
            html += '<p style="margin-top:0.5rem;font-size:0.82rem;color:var(--text-light);"><i class="far fa-calendar-alt"></i> Created on ' + new Date(guide.created_at).toLocaleDateString('zh-CN', {year:'numeric',month:'long',day:'numeric'}) + '</p>';
            // 快速统计
            html += '<div style="display:flex;gap:0.6rem;justify-content:center;margin-top:1rem;flex-wrap:wrap;">';
            if (guide.attractions && guide.attractions.length > 0) {
                html += '<span style="font-size:0.72rem;background:rgba(99,102,241,0.08);color:var(--primary);padding:3px 10px;border-radius:20px;font-weight:500;">📍 ' + guide.attractions.length + ' 景点</span>';
            }
            if (guide.foods && guide.foods.length > 0) {
                html += '<span style="font-size:0.72rem;background:rgba(220,38,38,0.06);color:#dc2626;padding:3px 10px;border-radius:20px;font-weight:500;">🍽️ ' + guide.foods.length + ' 美食</span>';
            }
            if (guide.phrases && guide.phrases.length > 0) {
                html += '<span style="font-size:0.72rem;background:rgba(16,185,129,0.08);color:#059669;padding:3px 10px;border-radius:20px;font-weight:500;">💬 ' + guide.phrases.length + ' 短语</span>';
            }
            html += '</div></div>';

            // Intro
            html += '<div class="guide-section" style="border-left:4px solid var(--primary);"><h3><i class="fas fa-globe-americas"></i> About ' + (guide.country || '') + '</h3><p style="line-height:1.8;">' + (guide.country || 'This destination') + ' is a beautiful place with amazing sights, rich culture, and delicious food. Here is my personal travel guide — crafted just for you! ✨</p></div>';

            // Attractions — 带图标编号
            html += '<div class="guide-section"><h3><i class="fas fa-star" style="color:#f59e0b;"></i> Must-Visit Places</h3><ul style="padding:0;margin:0;list-style:none;">';
            if (guide.attractions && guide.attractions.length > 0) {
                guide.attractions.forEach(function(a, idx) {
                    html += '<li style="padding:0.55rem 0;display:flex;align-items:center;gap:0.5rem;font-size:0.9rem;color:var(--text);border-bottom:1px solid var(--bg);"><span style="display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;font-size:0.7rem;font-weight:700;flex-shrink:0;">' + (idx+1) + '</span>' + a + '</li>';
                });
            } else {
                html += '<li style="color:var(--text-light);">暂未选择景点</li>';
            }
            html += '</ul></div>';

            // Phrases — 卡片式
            if (guide.phrases && guide.phrases.length > 0) {
                html += '<div class="guide-section"><h3><i class="fas fa-comment-dots" style="color:#10b981;"></i> Useful English Phrases</h3><div style="display:flex;flex-wrap:wrap;gap:0.45rem;">';
                guide.phrases.forEach(function(p) {
                    html += '<span style="background:rgba(16,185,129,0.07);color:#059669;padding:0.4rem 0.75rem;border-radius:20px;font-size:0.84rem;border:1px solid rgba(16,185,129,0.12);">"' + p + '"</span>';
                });
                html += '</div></div>';
            }

            // Foods
            if (guide.foods && guide.foods.length > 0) {
                html += '<div class="guide-section"><h3><i class="fas fa-utensils" style="color:#f97316;"></i> Must-Try Food 🤤</h3><p style="line-height:1.7;">I want to try: <strong>' + guide.foods.join('</strong>, <strong>') + '</strong>.</p></div>';
            }

            // Gifts
            if (guide.gifts && guide.gifts.length > 0) {
                html += '<div class="guide-section"><h3><i class="fas fa-gift" style="color:#ec4899;"></i> Souvenirs for... 🎁</h3><p>I will bring souvenirs for: <strong>' + guide.gifts.join(', ') + '</strong>.</p></div>';
            }

            // Footer
            html += '<div class="guide-result-footer"><p style="font-size:0.76rem;">This travel guide was created using <strong>Travelling Around the World</strong> learning platform 🌏✨</p></div>';

            // Actions
            html += '<div class="guide-actions"><button class="pf-generate-btn pf-btn-secondary" onclick="Portfolio.guide.create()"><i class="fas fa-plus-circle"></i> 再创建一篇</button><button class="pf-generate-btn pf-btn-ghost" onclick="Portfolio.guide.init()"><i class="fas fa-list"></i> 返回列表</button></div>';

            html += '</div>';
            return html;
        },

        view(index) {
            var guides = Portfolio._loadLocal('travel_guides') || [];
            var guide = guides[index];
            if (!guide) { App.toast('攻略不存在', 'error'); return; }
            var container = document.getElementById('guideContainer');
            container.innerHTML = Portfolio.guide._renderResult(guide, index);
        }
    },

    /* ========== 旅行手账 (Scrapbook) ========== */
    COUNTRY_PALETTE: {
        uk:     { grad:'linear-gradient(135deg,#1a365d,#2b6cb0)', accent:'#2b6cb0', illustration:'🏰' },
        usa:    { grad:'linear-gradient(135deg,#c53030,#2b6cb0)', accent:'#c53030', illustration:'🗽' },
        australia: { grad:'linear-gradient(135deg,#dd6b20,#ecc94b)', accent:'#dd6b20', illustration:'🦘' },
        canada:  { grad:'linear-gradient(135deg,#c53030,#ed8936)', accent:'#c53030', illustration:'🍁' },
        ireland: { grad:'linear-gradient(135deg,#276749,#48bb78)', accent:'#276749', illustration:'🍀' },
        newzealand: { grad:'linear-gradient(135deg,#234e52,#38a169)', accent:'#234e52', illustration:'🏔️' }
    },

    ACTIVITY_ICONS: {
        'visited famous landmarks':'🏛️','took beautiful photos':'📸','tried local food':'🍽️',
        'met friendly local people':'👋','went on a guided tour':'🎯','explored the city on foot':'🚶',
        'took a boat trip':'⛵','visited a museum':'🏛️','relaxed at the beach':'🏖️',
        'went hiking in nature':'🥾','watched a live performance':'🎭','bought souvenirs':'🎁',
        'learned about local history':'📜','tasted delicious street food':'🍢','went to a local market':'🛍️'
    },

    // 活动列表
    ACTIVITIES: [
        'visited famous landmarks','took beautiful photos','tried local food',
        'met friendly local people','went on a guided tour','explored the city on foot',
        'took a boat trip','visited a museum','relaxed at the beach',
        'went hiking in nature','watched a live performance','bought souvenirs',
        'learned about local history','tasted delicious street food','went to a local market'
    ],

    // 天气选项
    WEATHER: ['sunny','rainy','windy','foggy'],
    WEATHER_EMOJI: {'sunny':'☀️','rainy':'🌧️','windy':'💨','foggy':'🌫️'},

    // 心情选项
    MOOD: ['happy','excited','relaxed','tired'],
    MOOD_EMOJI: {'happy':'😊','excited':'🤩','relaxed':'😌','tired':'😴'},


    diary: {
        init() {
            var container = document.getElementById('diaryContainer');
            if (!container) return;
            var diaryEntries = Portfolio._loadLocal('travel_entries') || [];
            container.innerHTML = Portfolio.diary._renderScrapbook(diaryEntries);
            Portfolio.diary._animateStamps();
            // 绑定创建按钮（使用事件委托，更可靠）
            var createBtn = document.getElementById('sbCreateBtn');
            if (createBtn) {
                createBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    Portfolio.diary.create();
                });
            }
        },

        _renderScrapbook(entries) {
            // 统计
            var visitedCountries = {};
            entries.forEach(function(e) {
                if (!visitedCountries[e.destination]) visitedCountries[e.destination] = { count:0, lastDate:e.date };
                visitedCountries[e.destination].count++;
                if (e.date > visitedCountries[e.destination].lastDate) visitedCountries[e.destination].lastDate = e.date;
            });
            var countryCount = Object.keys(visitedCountries).length;
            var totalDays = entries.length;

            // 收集活动统计
            var allActs = {};
            entries.forEach(function(e) { e.activities.forEach(function(a) { allActs[a] = (allActs[a]||0)+1; }); });
            var topAct = '';
            var topActCount = 0;
            for (var k in allActs) { if (allActs[k] > topActCount) { topActCount = allActs[k]; topAct = k; } }

            var earnedCount = countryCount;
            var totalCount = DATA.resources.length;

            // ====== 页头 — 带动画的 Hero ======
            var html = '<div class="sb-hero" style="background:linear-gradient(135deg,#1a365d 0%,#2b6cb0 40%,#2563eb 65%,#16a34a 100%)"><div class="sb-hero-bg"></div>';
            html += '<h1><span class="hero-plane">✈️</span> 我的旅行手账</h1>';
            html += '<p>每一次勾选，都是一枚独一无二的旅行印章 🌏</p>';

            // 统计卡片 — 带图标
            html += '<div class="sb-hero-stats">';
            html += '<div class="sb-stat' + (countryCount === 0 ? ' empty-state' : '') + '"><span class="sb-stat-icon">🌍</span><div class="sb-stat-num">' + countryCount + '</div><div class="sb-stat-label">目的地</div></div>';
            html += '<div class="sb-stat' + (totalDays === 0 ? ' empty-state' : '') + '"><span class="sb-stat-icon">📖</span><div class="sb-stat-num">' + totalDays + '</div><div class="sb-stat-label">旅行记忆</div></div>';
            html += '<div class="sb-stat' + (topActCount === 0 ? ' empty-state' : '') + '"><span class="sb-stat-icon">' + (topAct ? (Portfolio.ACTIVITY_ICONS[topAct] || '⭐') : '⭐') + '</span><div class="sb-stat-num">' + (topActCount || 0) + '</div><div class="sb-stat-label">最爱的活动</div></div>';
            html += '</div></div>';

            html += '<div class="page-body"><div class="portfolio-section">';

            // ====== 护照印章栏 — 卡片包裹，带进度提示 ======
            html += '<div class="sb-stamp-section">';
            html += '<div class="sb-stamp-header"><h3>🛂 我的旅行印章</h3>';
            if (earnedCount > 0 && totalCount > 0) {
                html += '<span class="sb-stamp-progress">' + earnedCount + '/' + totalCount + ' 已解锁</span>';
            }
            html += '</div>';
            html += '<div class="sb-stamp-bar">';
            var allCountries = DATA.resources.map(function(c) { return {id:c.id, flag:c.flag, name:c.countryCN}; });
            allCountries.forEach(function(c) {
                var earned = !!visitedCountries[c.id];
                if (earned) {
                    html += '<div class="sb-stamp-slot earned" title="✅ 已解锁：' + c.name + '">' + c.flag + '<span class="stamp-tooltip">' + c.name + '</span></div>';
                } else {
                    html += '<div class="sb-stamp-slot" title="🔒 待解锁：' + c.name + '"><span class="stamp-lock-icon">🔒</span><span class="stamp-tooltip">' + c.name + ' · 待解锁</span></div>';
                }
            });
            html += '</div></div>'; // end sb-stamp-section

            // ====== 明信片墙 ======
            if (entries.length > 0) {
                html += '<h3 class="portfolio-subtitle" style="margin-top:1.5rem;">📬 旅行明信片</h3><div class="sb-postcard-wall">';
                entries.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
                entries.forEach(function(e, i) {
                    var c = DATA.resources.find(function(x) { return x.id === e.destination; });
                    var palette = Portfolio.COUNTRY_PALETTE[e.destination] || Portfolio.COUNTRY_PALETTE['uk'];
                    var destName = c ? c.countryCN : e.destination;
                    var flag = c ? c.flag : '🌍';
                    var illustration = palette.illustration;
                    var dateStr = new Date(e.date).toLocaleDateString('zh-CN', {month:'short',day:'numeric'});
                    var preview = e.activities.slice(0,2).map(function(a){return Portfolio.ACTIVITY_ICONS[a]||'';}).join(' ') + ' ' + (Portfolio.MOOD_EMOJI[e.mood]||'');
                    html += '<div class="sb-postcard" onclick="Portfolio.diary.viewEntry(' + i + ')" style="--accent:' + palette.accent + '">';
                    html += '<div class="sb-postcard-front" style="background:' + palette.grad + '">';
                    html += '<span style="font-size:3.5rem">' + illustration + '</span>';
                    html += '<div class="sb-postcard-stamp">' + (Portfolio.MOOD_EMOJI[e.mood]||'😊') + '</div>';
                    html += '</div>';
                    html += '<div class="sb-postcard-info">';
                    html += '<div class="sb-postcard-date">' + dateStr + '</div>';
                    html += '<div class="sb-postcard-dest">' + flag + ' ' + destName + '</div>';
                    html += '<div class="sb-postcard-mood">' + preview + '</div>';
                    html += '</div></div>';
                });
                html += '</div>';
            } else {
                // ====== 全新空状态 — 冒险主题场景 + 操作指引 ======
                html += '<div class="sb-empty"><div class="sb-empty-adventure">';
                // 场景插画
                html += '<div class="sb-empty-scene">';
                html += '<div class="sb-empty-sun"></div>';
                html += '<div class="sb-empty-cloud c1">☁️ Let\'s go!</div>';
                html += '<div class="sb-empty-cloud c2">☁️ Adventure!</div>';
                html += '<div class="sb-empty-mountains"></div>';
                html += '<div class="sb-empty-path"></div>';
                html += '<div class="sb-empty-plane">✈️</div>';
                html += '</div>';
                // 文字
                html += '<h3>你的冒险之旅即将开始 🚀</h3>';
                html += '<p>还没有旅行记录？点击下方绿色按钮，只需 4 步就能生成你的第一篇英文旅行日记！</p>';
                // 操作步骤
                html += '<div class="sb-steps-guide">';
                html += '<div class="sb-step-item"><span class="sb-step-num">1</span><span class="sb-step-text">选择一个你想去的国家 🌏</span></div>';
                html += '<div class="sb-step-item"><span class="sb-step-num">2</span><span class="sb-step-text">勾选你做了哪些有趣的事 ✅</span></div>';
                html += '<div class="sb-step-item"><span class="sb-step-num">3</span><span class="sb-step-text">选天气和心情 ☀️😊</span></div>';
                html += '<div class="sb-step-item"><span class="sb-step-num">4</span><span class="sb-step-text">点击生成，自动写好英文日记 ✨</span></div>';
                html += '</div>';
                // 标签
                html += '<div class="sb-empty-hint-tags">';
                html += '<span class="sb-empty-tag">✨ 零写作</span>';
                html += '<span class="sb-empty-tag">🎯 只需勾选</span>';
                html += '<span class="sb-empty-tag">🎨 自动生成</span>';
                html += '<span class="sb-empty-tag">📬 收集明信片</span>';
                html += '</div>';
                html += '</div></div>';
            }

            html += '<button class="sb-create-btn" id="sbCreateBtn"><i class="fas fa-feather-alt"></i> 开始新的旅行记忆 ✨</button>';
            html += '</div></div>';
            return html;
        },

        _animateStamps() {
            var stamps = document.querySelectorAll('.sb-stamp-slot.earned');
            stamps.forEach(function(s, i) {
                s.style.animationDelay = (i * 0.1) + 's';
                setTimeout(function() { s.classList.add('earned'); }, i * 100);
            });
        },

        create() {
            try {
                var container = document.getElementById('diaryContainer');
                if (!container) {
                    var msg = '页面加载异常，请刷新';
                    if (typeof App !== 'undefined' && App.toast) App.toast(msg, 'error');
                    else alert(msg);
                    return;
                }
                container.innerHTML = Portfolio.diary._renderBuilder();
                Portfolio.diary._bindBuilderEvents();
            } catch(e) {
                console.error('diary.create error:', e);
                var errMsg = '打开创建页面失败：' + e.message;
                if (typeof App !== 'undefined' && App.toast) App.toast(errMsg, 'error');
                else alert(errMsg);
            }
        },

        _renderBuilder() {
            if (typeof DATA === 'undefined') {
                return '<div class="sb-empty"><h3>⚠️ 数据加载失败</h3><p>请刷新页面重试。如果问题持续，请联系老师。</p></div>';
            }
            var today = new Date().toISOString().split('T')[0];

            var html = '<div class="pf-header-small"><button class="pf-back-btn" onclick="Portfolio.diary.init()"><i class="fas fa-arrow-left"></i> 返回手账</button><h2>✏️ 今日旅行手账</h2></div>';
            html += '<div class="pf-form">';

            // Step 1: 选目的地 — 国家卡片
            html += '<div class="pf-step"><div class="pf-step-title"><span class="pf-step-num">1</span> 今天飞去哪？</div>';
            html += '<div class="pf-field" style="margin-bottom:0.6rem"><label>日期</label><input type="date" id="diaryDate" value="' + today + '" class="pf-input"></div>';
            html += '<div class="sb-country-grid" id="countryGrid">';
            DATA.resources.forEach(function(c) {
                var p = Portfolio.COUNTRY_PALETTE[c.id] || { illustration:'🌍' };
                html += '<div class="sb-country-card" data-country="' + c.id + '"><span class="sb-cc-flag">' + p.illustration + '</span><span class="sb-cc-name">' + c.flag + ' ' + c.countryCN + '</span></div>';
            });
            html += '</div><input type="hidden" id="diaryDest" value=""></div>';

            // Step 2: 活动贴纸
            html += '<div class="pf-step"><div class="pf-step-title"><span class="pf-step-num">2</span> 今天做了什么？（点击贴纸）</div><div class="sb-sticker-grid" id="stickerGrid">';
            Portfolio.ACTIVITIES.forEach(function(a, i) {
                var icon = Portfolio.ACTIVITY_ICONS[a] || '✨';
                html += '<span class="sb-sticker" data-act="' + Portfolio._escape(a) + '"><span class="sb-sticker-icon">' + icon + '</span>' + a + '</span>';
            });
            html += '</div></div>';

            // Step 3: 天气 + 心情 (并排)
            html += '<div class="pf-step"><div class="pf-step-title"><span class="pf-step-num">3</span> 天气 & 心情</div>';
            html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0.8rem">';
            html += '<div><label style="font-size:0.78rem;color:var(--text-light);margin-bottom:0.4rem;display:block">天气</label><div class="pf-option-grid" style="grid-template-columns:repeat(2,1fr)">';
            Portfolio.WEATHER.forEach(function(w) {
                html += '<label class="pf-option-card pf-option-sm pf-radio"><input type="radio" name="diaryWeather" value="' + w + '"><span class="pf-option-emoji">' + (Portfolio.WEATHER_EMOJI[w] || '') + '</span><span class="pf-option-label">' + w + '</span></label>';
            });
            html += '</div></div>';
            html += '<div><label style="font-size:0.78rem;color:var(--text-light);margin-bottom:0.4rem;display:block">心情</label><div class="pf-option-grid" style="grid-template-columns:repeat(2,1fr)">';
            Portfolio.MOOD.forEach(function(m) {
                html += '<label class="pf-option-card pf-option-sm pf-radio"><input type="radio" name="diaryMood" value="' + m + '"><span class="pf-option-emoji">' + (Portfolio.MOOD_EMOJI[m] || '') + '</span><span class="pf-option-label">' + m + '</span></label>';
            });
            html += '</div></div></div></div>';

            // Step 4: 词汇
            html += '<div class="pf-step"><div class="pf-step-title"><span class="pf-step-num">4</span> 今天学了什么词汇？</div>';
            var learned = Portfolio.getLearnedVocab();
            if (learned.length > 0) {
                html += '<div class="pf-vocab-hint">已为你提取学习记录中的词汇：</div><div class="sb-sticker-grid">';
                learned.forEach(function(v) {
                    html += '<label class="sb-sticker checked"><input type="checkbox" name="diaryVocab" value="' + Portfolio._escape(v) + '" checked style="display:none"><span>' + v + '</span></label>';
                });
                html += '</div>';
            } else {
                html += '<p class="pf-empty-hint">还没有学习的词汇，先去学习模块看看吧！</p>';
            }
            html += '</div>';

            // Generate
            html += '<div class="pf-step"><button class="pf-generate-btn" id="diaryGenerateBtn" style="background:linear-gradient(135deg,#0f6e56,#1d9e75)"><i class="fas fa-stamp"></i> 盖上旅行印章！</button></div>';

            html += '</div>';
            return html;
        },

        _selectCountry(el, countryId) {
            document.querySelectorAll('.sb-country-card').forEach(function(c) { c.classList.remove('selected'); });
            el.classList.add('selected');
            document.getElementById('diaryDest').value = countryId;
        },

        _toggleSticker(el) {
            el.classList.toggle('checked');
            // 同步 hidden checkbox
            var val = el.getAttribute('data-act');
            var existing = document.querySelector('input[name="diaryAct"][value="' + Portfolio._escape(val).replace(/"/g,'&quot;') + '"]');
            if (el.classList.contains('checked') && !existing) {
                var input = document.createElement('input');
                input.type = 'checkbox';
                input.name = 'diaryAct';
                input.value = val;
                input.checked = true;
                input.style.display = 'none';
                el.appendChild(input);
            } else if (!el.classList.contains('checked') && existing) {
                existing.remove();
            }
        },

        _bindBuilderEvents() {
            // 国家卡片点击
            var grid = document.getElementById('countryGrid');
            if (grid) {
                grid.addEventListener('click', function(e) {
                    var card = e.target.closest('.sb-country-card');
                    if (!card) return;
                    Portfolio.diary._selectCountry(card, card.dataset.country);
                });
            }
            // 贴纸点击
            var stickerGrid = document.getElementById('stickerGrid');
            if (stickerGrid) {
                stickerGrid.addEventListener('click', function(e) {
                    var sticker = e.target.closest('.sb-sticker');
                    if (!sticker) return;
                    Portfolio.diary._toggleSticker(sticker);
                });
            }
            // 生成按钮
            var genBtn = document.getElementById('diaryGenerateBtn');
            if (genBtn) {
                genBtn.addEventListener('click', function() { Portfolio.diary.generate(); });
            }
            // 返回按钮（使用事件委托在init里处理）
        },

        generate() {
            var date = document.getElementById('diaryDate').value;
            var dest = document.getElementById('diaryDest').value;
            var weatherEl = document.querySelector('input[name="diaryWeather"]:checked');
            var moodEl = document.querySelector('input[name="diaryMood"]:checked');

            if (!date) { App.toast('请选择日期', 'error'); return; }
            if (!dest) { App.toast('请选择目的地（点击国家卡片）', 'error'); return; }
            if (!weatherEl) { App.toast('请选择天气', 'error'); return; }
            if (!moodEl) { App.toast('请选择心情', 'error'); return; }

            var activities = Portfolio._getChecked('diaryAct');
            var vocabs = Portfolio._getChecked('diaryVocab');

            var entry = {
                date: date,
                destination: dest,
                activities: activities,
                weather: weatherEl.value,
                mood: moodEl.value,
                vocab: vocabs,
                created_at: new Date().toISOString()
            };

            // Save
            var entries = Portfolio._loadLocal('travel_entries') || [];
            entries.push(entry);
            Portfolio._saveLocal('travel_entries', entries);
            Portfolio._syncDiaryToCloud(entry);

            // Show result
            var container = document.getElementById('diaryContainer');
            container.innerHTML = Portfolio.diary._renderPostcard(entry);
            App.toast('旅行印章已盖上！📬', 'success');
        },

        _renderPostcard(entry) {
            var c = DATA.resources.find(function(x) { return x.id === entry.destination; });
            var palette = Portfolio.COUNTRY_PALETTE[entry.destination] || Portfolio.COUNTRY_PALETTE['uk'];
            var destName = c ? c.flag + ' ' + c.countryCN : entry.destination;

            // Build diary text
            var diaryText = 'Today I visited ' + (c ? c.country : entry.destination) + '. ';
            if (entry.activities.length > 0) {
                diaryText += 'I ' + entry.activities.join(', ') + '. ';
            }
            diaryText += 'The weather was ' + entry.weather + '. ';
            if (entry.vocab.length > 0) {
                diaryText += 'I learned some new words: ' + entry.vocab.join(', ') + '. ';
            }
            diaryText += 'I feel ' + entry.mood + '!';

            var dateFull = new Date(entry.date).toLocaleDateString('zh-CN', {weekday:'long',year:'numeric',month:'long',day:'numeric'});
            var dateShort = new Date(entry.date).toLocaleDateString('zh-CN', {month:'short',day:'numeric'});

            var html = '<div class="pf-header-small"><button class="pf-back-btn" onclick="Portfolio.diary.init()"><i class="fas fa-arrow-left"></i> 返回手账</button><h2>📬 ' + Portfolio.MOOD_EMOJI[entry.mood] + ' 旅行明信片</h2></div>';

            html += '<div class="sb-postcard-result">';
            html += '<div class="sb-postcard-big">';
            // 正面 — 目的地插画
            html += '<div class="sb-postcard-big-front" style="background:' + palette.grad + '">';
            html += '<span class="sb-pbf-flag">' + palette.illustration + '</span>';
            html += '<span class="sb-pbf-country">' + destName + '</span>';
            html += '<span class="sb-pbf-date">' + dateShort + '</span>';
            html += '<span class="sb-pbf-weather">' + (Portfolio.WEATHER_EMOJI[entry.weather] || '') + '</span>';
            html += '<div class="sb-big-stamp">' + (c ? c.flag : '🌍') + '</div>';
            html += '</div>';
            // 背面 — 日记正文
            html += '<div class="sb-postcard-big-body">';
            html += '<div class="sb-pbb-text">' + diaryText + '</div>';
            html += '<div class="sb-pbb-divider"></div>';
            html += '<div style="font-size:0.78rem;color:#8b7355;font-style:italic">— ' + dateFull + '</div>';
            html += '<div class="sb-pbb-details">';
            html += '<div class="sb-pbb-detail"><div class="sb-pbbd-label">Activities</div><div class="sb-pbbd-val">' + (entry.activities.length > 0 ? entry.activities.map(function(a){return (Portfolio.ACTIVITY_ICONS[a]||'')+' '+a;}).join(', ') : '—') + '</div></div>';
            html += '<div class="sb-pbb-detail"><div class="sb-pbbd-label">Weather</div><div class="sb-pbbd-val">' + (Portfolio.WEATHER_EMOJI[entry.weather]||'') + ' ' + entry.weather + '</div></div>';
            html += '<div class="sb-pbb-detail"><div class="sb-pbbd-label">Mood</div><div class="sb-pbbd-val">' + (Portfolio.MOOD_EMOJI[entry.mood]||'') + ' ' + entry.mood + '</div></div>';
            html += '<div class="sb-pbb-detail"><div class="sb-pbbd-label">New Words</div><div class="sb-pbbd-val">' + (entry.vocab.length > 0 ? entry.vocab.join(', ') : '—') + '</div></div>';
            html += '</div></div></div>';

            html += '<div class="guide-actions" style="margin-top:1.5rem"><button class="pf-generate-btn" onclick="Portfolio.diary.create()"><i class="fas fa-plus-circle"></i> 再写一篇</button><button class="pf-generate-btn pf-btn-ghost" onclick="Portfolio.diary.init()"><i class="fas fa-images"></i> 我的明信片墙</button></div>';
            html += '</div>';
            return html;
        },

        viewEntry(index) {
            var entries = Portfolio._loadLocal('travel_entries') || [];
            entries.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
            var entry = entries[index];
            if (!entry) { App.toast('这篇旅行记忆找不到了', 'error'); return; }
            var container = document.getElementById('diaryContainer');
            container.innerHTML = Portfolio.diary._renderPostcard(entry);
        }
    },

    /* ========== 本地存储 ========== */
    _loadLocal(key) {
        try {
            var raw = localStorage.getItem('travelEdu_' + key + '_' + (SupabaseAuth.currentUsername || ''));
            return raw ? JSON.parse(raw) : null;
        } catch(e) {
            return null;
        }
    },

    _saveLocal(key, data) {
        if (!SupabaseAuth.currentUsername) return;
        localStorage.setItem('travelEdu_' + key + '_' + SupabaseAuth.currentUsername, JSON.stringify(data));
    },

    /* ========== 云端同步 ========== */
    async _syncGuideToCloud(guide) {
        if (!SupabaseAuth.currentUsername || typeof db === 'undefined') return;
        try {
            await db.from('travel_guides').insert([{
                username: SupabaseAuth.currentUsername,
                country_id: guide.country_id,
                attractions: guide.attractions,
                phrases: guide.phrases,
                foods: guide.foods,
                gifts: guide.gifts,
                created_at: guide.created_at
            }]);
        } catch(e) {
            console.warn('[Portfolio] 攻略同步失败:', e);
        }
    },

    async _syncDiaryToCloud(entry) {
        if (!SupabaseAuth.currentUsername || typeof db === 'undefined') return;
        try {
            await db.from('travel_diary').insert([{
                username: SupabaseAuth.currentUsername,
                destination: entry.destination,
                activities: entry.activities,
                weather: entry.weather,
                mood: entry.mood,
                vocab: entry.vocab,
                entry_date: entry.date,
                created_at: entry.created_at
            }]);
        } catch(e) {
            console.warn('[Portfolio] 日记同步失败:', e);
        }
    },

    /* ========== 工具方法 ========== */
    _getChecked(name) {
        var results = [];
        var nodes = document.querySelectorAll('input[name="' + name + '"]:checked');
        nodes.forEach(function(n) { results.push(n.value); });
        return results;
    },

    _escape(str) {
        return (str || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    },

    _pickRandom(arr, n) {
        var shuffled = arr.slice().sort(function() { return 0.5 - Math.random(); });
        return shuffled.slice(0, n);
    }
};
