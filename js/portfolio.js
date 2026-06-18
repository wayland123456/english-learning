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
        const progress = SupabaseAuth.getProgress();
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
            var html = '<div class="page-header portfolio-header" style="background:linear-gradient(135deg,#667eea,#764ba2)"><div class="page-header-overlay"></div><div class="page-header-content"><h1><i class="fas fa-map-marked-alt"></i> 我的旅行攻略</h1><p>勾选你喜欢的选项，一键生成属于你自己的英文旅行攻略！</p></div></div>';
            html += '<div class="page-body"><div class="portfolio-section">';

            if (guides.length > 0) {
                html += '<h3 class="portfolio-subtitle">已创建的攻略</h3><div class="portfolio-card-list">';
                guides.forEach(function(g, i) {
                    var country = DATA.resources.find(function(c) { return c.id === g.country_id; });
                    var countryCN = country ? country.countryCN : g.country_id;
                    var flag = country ? country.flag : '';
                    html += '<div class="portfolio-card" onclick="Portfolio.guide.view(' + i + ')"><div class="portfolio-card-icon">' + flag + '</div><div class="portfolio-card-info"><div class="portfolio-card-title">' + countryCN + ' Travel Guide</div><div class="portfolio-card-meta">' + (g.attractions ? g.attractions.length : 0) + ' attractions selected \u00b7 ' + new Date(g.created_at).toLocaleDateString('zh-CN') + '</div></div><div class="portfolio-card-arrow"><i class="fas fa-chevron-right"></i></div></div>';
                });
                html += '</div>';
            }

            html += '<button class="portfolio-create-btn" onclick="Portfolio.guide.create()"><i class="fas fa-plus-circle"></i> 创建新攻略</button>';
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
            var html = '<div class="pf-header-small"><button class="pf-back-btn" onclick="Portfolio.guide.init()"><i class="fas fa-arrow-left"></i> 返回列表</button><h2>' + guide.flag + ' ' + guide.countryCN + ' Travel Guide</h2></div>';
            html += '<div class="guide-result">';

            // Title
            html += '<div class="guide-result-hero"><h1>' + guide.flag + ' My Travel Guide to ' + guide.country + '</h1><p class="guide-date">Created on ' + new Date(guide.created_at).toLocaleDateString('zh-CN', {year:'numeric',month:'long',day:'numeric'}) + '</p></div>';

            // Intro
            html += '<div class="guide-section"><h3><i class="fas fa-info-circle"></i> About ' + guide.country + '</h3><p>' + guide.country + ' is a beautiful country with amazing sights, rich culture, and delicious food. Here is my personal travel guide!</p></div>';

            // Attractions
            html += '<div class="guide-section"><h3><i class="fas fa-star"></i> Must-Visit Places</h3><ul>';
            guide.attractions.forEach(function(a) {
                html += '<li>' + a + '</li>';
            });
            html += '</ul></div>';

            // Phrases
            if (guide.phrases.length > 0) {
                html += '<div class="guide-section"><h3><i class="fas fa-comment-dots"></i> Useful English Phrases</h3><ul>';
                guide.phrases.forEach(function(p) {
                    html += '<li>"' + p + '"</li>';
                });
                html += '</ul></div>';
            }

            // Foods
            if (guide.foods.length > 0) {
                html += '<div class="guide-section"><h3><i class="fas fa-utensils"></i> Must-Try Food</h3><p>I want to try: ' + guide.foods.join(', ') + '.</p></div>';
            }

            // Gifts
            if (guide.gifts.length > 0) {
                html += '<div class="guide-section"><h3><i class="fas fa-gift"></i> Souvenirs for...</h3><p>I will bring souvenirs for: ' + guide.gifts.join(', ') + '.</p></div>';
            }

            // Footer
            html += '<div class="guide-result-footer"><p>This travel guide was created using Travelling Around the World learning platform.</p></div>';

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

    /* ========== 旅行日记 ========== */
    diary: {
        init() {
            var container = document.getElementById('diaryContainer');
            var diaryEntries = Portfolio._loadLocal('travel_entries') || [];
            container.innerHTML = Portfolio.diary._renderList(diaryEntries);
        },

        _renderList(entries) {
            var html = '<div class="page-header portfolio-header" style="background:linear-gradient(135deg,#0f6e56,#1d9e75)"><div class="page-header-overlay"></div><div class="page-header-content"><h1><i class="fas fa-book-open"></i> 旅行日记</h1><p>每天选一选，自动生成一篇英文旅行日记！</p></div></div>';
            html += '<div class="page-body"><div class="portfolio-section">';

            if (entries.length > 0) {
                html += '<h3 class="portfolio-subtitle">我的旅程</h3><div class="diary-timeline">';
                entries.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
                entries.forEach(function(e, i) {
                    var c = DATA.resources.find(function(x) { return x.id === e.destination; });
                    var dest = c ? c.flag + ' ' + c.countryCN : e.destination;
                    html += '<div class="diary-entry" onclick="Portfolio.diary.viewEntry(' + i + ')"><div class="diary-entry-dot"></div><div class="diary-entry-card"><div class="diary-entry-date">' + new Date(e.date).toLocaleDateString('zh-CN', {month:'short',day:'numeric'}) + '</div><div class="diary-entry-dest">' + dest + '</div><div class="diary-entry-mood">' + (Portfolio.MOOD_EMOJI[e.mood] || '') + ' ' + e.mood + '</div></div></div>';
                });
                html += '</div>';
            } else {
                html += '<div class="pf-empty"><i class="fas fa-feather-alt"></i><h3>还没有旅行日记</h3><p>快写一篇你的虚拟旅行日记吧！</p></div>';
            }

            html += '<button class="portfolio-create-btn" onclick="Portfolio.diary.create()"><i class="fas fa-plus-circle"></i> 写一篇新日记</button>';
            html += '</div></div>';
            return html;
        },

        create() {
            var container = document.getElementById('diaryContainer');
            container.innerHTML = Portfolio.diary._renderBuilder();
            Portfolio.diary._bindBuilderEvents();
        },

        _renderBuilder() {
            var today = new Date().toISOString().split('T')[0];

            var html = '<div class="pf-header-small"><button class="pf-back-btn" onclick="Portfolio.diary.init()"><i class="fas fa-arrow-left"></i> 返回</button><h2>写一篇新日记</h2></div>';
            html += '<div class="pf-form">';

            // Step 1: Date + Destination
            html += '<div class="pf-step"><div class="pf-step-title"><span class="pf-step-num">1</span> 日期 & 目的地</div>';
            html += '<div class="pf-row"><div class="pf-field"><label>日期</label><input type="date" id="diaryDate" value="' + today + '" class="pf-input"></div>';
            html += '<div class="pf-field"><label>目的地</label><select id="diaryDest" class="pf-input"><option value="">选择城市</option>';
            DATA.resources.forEach(function(c) {
                c.attractions.forEach(function(a) {
                    var loc = a.location.split(',')[0].trim();
                    html += '<option value="' + c.id + '">' + c.flag + ' ' + loc + '</option>';
                });
            });
            html += '</select></div></div></div>';

            // Step 2: Activities
            html += '<div class="pf-step"><div class="pf-step-title"><span class="pf-step-num">2</span> 今天做了什么？（多选）</div><div class="pf-check-grid">';
            Portfolio.ACTIVITIES.forEach(function(a) {
                html += '<label class="pf-check-item"><input type="checkbox" name="diaryAct" value="' + Portfolio._escape(a) + '"><span>' + a + '</span></label>';
            });
            html += '</div></div>';

            // Step 3: Weather
            html += '<div class="pf-step"><div class="pf-step-title"><span class="pf-step-num">3</span> 天气怎么样？</div><div class="pf-option-grid">';
            Portfolio.WEATHER.forEach(function(w) {
                html += '<label class="pf-option-card pf-option-sm pf-radio"><input type="radio" name="diaryWeather" value="' + w + '"><span class="pf-option-emoji">' + (Portfolio.WEATHER_EMOJI[w] || '') + '</span><span class="pf-option-label">' + w + '</span></label>';
            });
            html += '</div></div>';

            // Step 4: Mood
            html += '<div class="pf-step"><div class="pf-step-title"><span class="pf-step-num">4</span> 心情如何？</div><div class="pf-option-grid">';
            Portfolio.MOOD.forEach(function(m) {
                html += '<label class="pf-option-card pf-option-sm pf-radio"><input type="radio" name="diaryMood" value="' + m + '"><span class="pf-option-emoji">' + (Portfolio.MOOD_EMOJI[m] || '') + '</span><span class="pf-option-label">' + m + '</span></label>';
            });
            html += '</div></div>';

            // Step 5: Vocab
            html += '<div class="pf-step"><div class="pf-step-title"><span class="pf-step-num">5</span> 今天学了什么词汇？（自动提取 + 可追加）</div>';
            var learned = Portfolio.getLearnedVocab();
            if (learned.length > 0) {
                html += '<div class="pf-vocab-hint">已为你提取学习记录中的词汇：</div><div class="pf-check-grid">';
                learned.forEach(function(v) {
                    html += '<label class="pf-check-item pf-check-sm"><input type="checkbox" name="diaryVocab" value="' + Portfolio._escape(v) + '" checked><span>' + v + '</span></label>';
                });
                html += '</div>';
            } else {
                html += '<p class="pf-empty-hint">还没有学习的词汇，先去学习模块看看吧！</p>';
            }
            html += '</div>';

            // Generate
            html += '<div class="pf-step"><button class="pf-generate-btn" onclick="Portfolio.diary.generate()"><i class="fas fa-feather-alt"></i> 一键生成日记！</button></div>';

            html += '</div>';
            return html;
        },

        _bindBuilderEvents() {},

        generate() {
            var date = document.getElementById('diaryDate').value;
            var dest = document.getElementById('diaryDest').value;
            var weatherEl = document.querySelector('input[name="diaryWeather"]:checked');
            var moodEl = document.querySelector('input[name="diaryMood"]:checked');

            if (!date) { App.toast('请选择日期', 'error'); return; }
            if (!dest) { App.toast('请选择目的地', 'error'); return; }
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
            container.innerHTML = Portfolio.diary._renderEntry(entry);
            App.toast('日记生成成功！', 'success');
        },

        _renderEntry(entry) {
            var c = DATA.resources.find(function(x) { return x.id === entry.destination; });
            var destName = c ? c.flag + ' ' + c.country : entry.destination;
            var locName = '';
            if (c) {
                var attr = c.attractions[0];
                if (attr) locName = attr.location;
            }

            var html = '<div class="pf-header-small"><button class="pf-back-btn" onclick="Portfolio.diary.init()"><i class="fas fa-arrow-left"></i> 返回列表</button><h2>' + Portfolio.MOOD_EMOJI[entry.mood] + ' 旅行日记</h2></div>';
            html += '<div class="diary-result">';

            // Build the diary text
            var diaryText = 'Today I visited ' + destName + '. ';
            if (entry.activities.length > 0) {
                diaryText += 'I ' + entry.activities.join(', ') + '. ';
            }
            diaryText += 'The weather was ' + entry.weather + '. ';
            if (entry.vocab.length > 0) {
                diaryText += 'I learned some new words: ' + entry.vocab.join(', ') + '. ';
            }
            diaryText += 'I feel ' + entry.mood + '!';

            html += '<div class="diary-result-card"><div class="diary-result-date">' + new Date(entry.date).toLocaleDateString('zh-CN', {weekday:'long',year:'numeric',month:'long',day:'numeric'}) + '</div><div class="diary-result-dest">' + Portfolio.WEATHER_EMOJI[entry.weather] + ' ' + destName + ' ' + Portfolio.MOOD_EMOJI[entry.mood] + '</div><div class="diary-result-text">' + diaryText + '</div></div>';

            // Details
            html += '<div class="diary-details"><div class="diary-detail-item"><span class="diary-detail-label">Activities</span><span>' + (entry.activities.length > 0 ? entry.activities.join(', ') : 'None') + '</span></div><div class="diary-detail-item"><span class="diary-detail-label">Weather</span><span>' + Portfolio.WEATHER_EMOJI[entry.weather] + ' ' + entry.weather + '</span></div><div class="diary-detail-item"><span class="diary-detail-label">Mood</span><span>' + Portfolio.MOOD_EMOJI[entry.mood] + ' ' + entry.mood + '</span></div><div class="diary-detail-item"><span class="diary-detail-label">New Words</span><span>' + (entry.vocab.length > 0 ? entry.vocab.join(', ') : 'None') + '</span></div></div>';

            html += '<div class="guide-actions"><button class="pf-generate-btn" onclick="Portfolio.diary.create()"><i class="fas fa-plus-circle"></i> 再写一篇</button><button class="pf-generate-btn pf-btn-ghost" onclick="Portfolio.diary.init()"><i class="fas fa-list"></i> 日记列表</button></div>';

            html += '</div>';
            return html;
        },

        viewEntry(index) {
            var entries = Portfolio._loadLocal('travel_entries') || [];
            entries.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
            var entry = entries[index];
            if (!entry) { App.toast('日记不存在', 'error'); return; }
            var container = document.getElementById('diaryContainer');
            container.innerHTML = Portfolio.diary._renderEntry(entry);
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
