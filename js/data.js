/* ============================================
   数据文件 - 所有学习内容（Bilibili视频版）
   主视频源：BV1BE42157ZP《Our World Landmarks》30集系列
   ============================================ */

const DATA = {
    // ---- 自主学习资源（6大英语国家，20个标志性景点） ----
    resources: [
        {
            id: 'uk',
            country: 'United Kingdom',
            countryCN: '英国',
            flag: '🇬🇧',
            countryVideo: { bvid: 'BV12Z421N7DZ' },
            attractions: [
                {
                    title: 'Big Ben & the Houses of Parliament',
                    location: 'London, England',
                    description: 'Big Ben is the nickname for the Great Bell of the clock at the north end of the Palace of Westminster. The tower is one of the most prominent symbols of the United Kingdom and is often used in establishing film settings set in London.',
                    vocabulary: [
                        { word: 'Parliament', meaning: 'n. 议会' },
                        { word: 'iconic', meaning: 'adj. 标志性的' },
                        { word: 'landmark', meaning: 'n. 地标' },
                        { word: 'heritage', meaning: 'n. 遗产' },
                        { word: 'Gothic architecture', meaning: '哥特式建筑' }
                    ]
                },
                {
                    title: 'The Tower of London',
                    location: 'London, England',
                    description: 'The Tower of London is a historic castle on the north bank of the River Thames. Founded in 1066, it has served as a royal palace, prison, and treasury. The Crown Jewels have been kept there since the 14th century.',
                    vocabulary: [
                        { word: 'conquest', meaning: 'n. 征服' },
                        { word: 'fortress', meaning: 'n. 堡垒' },
                        { word: 'crown jewels', meaning: '皇冠珠宝' },
                        { word: 'execution', meaning: 'n. 处决' },
                        { word: 'medieval', meaning: 'adj. 中世纪的' }
                    ]
                },
                {
                    title: 'Buckingham Palace',
                    location: 'London, England',
                    description: 'Buckingham Palace is the London residence and administrative headquarters of the monarch of the United Kingdom. The Changing of the Guard ceremony is one of the most popular tourist attractions in London.',
                    vocabulary: [
                        { word: 'residence', meaning: 'n. 住所' },
                        { word: 'monarch', meaning: 'n. 君主' },
                        { word: 'ceremony', meaning: 'n. 仪式' },
                        { word: 'guard', meaning: 'n. 卫兵' },
                        { word: 'administrative', meaning: 'adj. 行政的' }
                    ]
                },
                {
                    title: 'Stonehenge',
                    location: 'Wiltshire, England',
                    description: 'Stonehenge is a prehistoric monument consisting of a ring of standing stones, dating back to around 3000 BC. It remains one of the most famous and mysterious archaeological sites in the world.',
                    vocabulary: [
                        { word: 'prehistoric', meaning: 'adj. 史前的' },
                        { word: 'monument', meaning: 'n. 纪念碑/遗迹' },
                        { word: 'mysterious', meaning: 'adj. 神秘的' },
                        { word: 'ancient', meaning: 'adj. 古代的' },
                        { word: 'archaeological', meaning: 'adj. 考古的' }
                    ]
                }
            ]
        },
        {
            id: 'usa',
            country: 'United States',
            countryCN: '美国',
            flag: '🇺🇸',
            countryVideo: { bvid: 'BV1hw4m1Y7vW' },
            attractions: [
                {
                    title: 'The Statue of Liberty',
                    location: 'New York City, USA',
                    description: 'The Statue of Liberty is a colossal neoclassical sculpture on Liberty Island in New York Harbor. A gift from France, it was dedicated in 1886 and has become an enduring symbol of freedom and democracy.',
                    vocabulary: [
                        { word: 'colossal', meaning: 'adj. 巨大的' },
                        { word: 'neoclassical', meaning: 'adj. 新古典主义的' },
                        { word: 'sculpture', meaning: 'n. 雕塑' },
                        { word: 'symbol', meaning: 'n. 象征' },
                        { word: 'dedicate', meaning: 'v. 奉献/落成' }
                    ]
                },
                {
                    title: 'The Grand Canyon',
                    location: 'Arizona, USA',
                    description: 'The Grand Canyon is a steep-sided canyon carved by the Colorado River. It is 277 miles long, up to 18 miles wide, and over a mile deep. It is considered one of the Seven Natural Wonders of the World.',
                    vocabulary: [
                        { word: 'canyon', meaning: 'n. 峡谷' },
                        { word: 'carved', meaning: 'v. 雕刻/冲刷形成' },
                        { word: 'overwhelming', meaning: 'adj. 令人震撼的' },
                        { word: 'intricate', meaning: 'adj. 错综复杂的' },
                        { word: 'landscape', meaning: 'n. 景观' }
                    ]
                },
                {
                    title: 'The Golden Gate Bridge',
                    location: 'San Francisco, USA',
                    description: 'The Golden Gate Bridge is a suspension bridge spanning the Golden Gate strait. Completed in 1937, it was the longest suspension bridge in the world at that time and has become one of the most internationally recognized symbols of San Francisco.',
                    vocabulary: [
                        { word: 'suspension bridge', meaning: 'n. 悬索桥' },
                        { word: 'spanning', meaning: 'v. 横跨' },
                        { word: 'strait', meaning: 'n. 海峡' },
                        { word: 'recognized', meaning: 'adj. 公认的' },
                        { word: 'engineering', meaning: 'n. 工程' }
                    ]
                },
                {
                    title: 'Yellowstone National Park',
                    location: 'Wyoming, USA',
                    description: 'Yellowstone National Park, established in 1872, was the first national park in the world. It is known for its wildlife and geothermal features, especially Old Faithful Geyser, one of the most popular features in the park.',
                    vocabulary: [
                        { word: 'establish', meaning: 'v. 建立' },
                        { word: 'geothermal', meaning: 'adj. 地热的' },
                        { word: 'geyser', meaning: 'n. 间歇泉' },
                        { word: 'wildlife', meaning: 'n. 野生动物' },
                        { word: 'conservation', meaning: 'n. 保护' }
                    ]
                }
            ]
        },
        {
            id: 'australia',
            country: 'Australia',
            countryCN: '澳大利亚',
            flag: '🇦🇺',
            countryVideo: { bvid: 'BV1hS411P7tP' },
            attractions: [
                {
                    title: 'Sydney Opera House',
                    location: 'Sydney, Australia',
                    description: 'The Sydney Opera House is a multi-venue performing arts centre identified as one of the 20th century\'s most distinctive buildings. Designed by Danish architect Jørn Utzon, it was declared a UNESCO World Heritage Site in 2007.',
                    vocabulary: [
                        { word: 'venue', meaning: 'n. 场馆' },
                        { word: 'distinctive', meaning: 'adj. 独特的' },
                        { word: 'performing arts', meaning: '表演艺术' },
                        { word: 'masterpiece', meaning: 'n. 杰作' },
                        { word: 'architect', meaning: 'n. 建筑师' }
                    ]
                },
                {
                    title: 'The Great Barrier Reef',
                    location: 'Queensland, Australia',
                    description: 'The Great Barrier Reef is the world\'s largest coral reef system, visible from outer space. It stretches over 2,300 kilometres and is home to more than 1,500 species of fish and 400 types of coral.',
                    vocabulary: [
                        { word: 'coral reef', meaning: 'n. 珊瑚礁' },
                        { word: 'visible', meaning: 'adj. 可见的' },
                        { word: 'species', meaning: 'n. 物种' },
                        { word: 'marine', meaning: 'adj. 海洋的' },
                        { word: 'biodiversity', meaning: 'n. 生物多样性' }
                    ]
                },
                {
                    title: 'Uluru (Ayers Rock)',
                    location: 'Northern Territory, Australia',
                    description: 'Uluru, also known as Ayers Rock, is a large sandstone rock formation in the southern part of the Northern Territory. It is sacred to the Aboriginal people and is listed as a UNESCO World Heritage Site.',
                    vocabulary: [
                        { word: 'sandstone', meaning: 'n. 砂岩' },
                        { word: 'formation', meaning: 'n. 构造/形态' },
                        { word: 'sacred', meaning: 'adj. 神圣的' },
                        { word: 'Aboriginal', meaning: 'adj./n. 原住的/原住民' },
                        { word: 'magnificent', meaning: 'adj. 壮丽的' }
                    ]
                }
            ]
        },
        {
            id: 'canada',
            country: 'Canada',
            countryCN: '加拿大',
            flag: '🇨🇦',
            countryVideo: { bvid: 'BV1QS411c7vx' },
            attractions: [
                {
                    title: 'Niagara Falls',
                    location: 'Ontario, Canada',
                    description: 'Niagara Falls is a group of waterfalls on the border between Canada and the United States. Known as one of the world\'s most spectacular natural wonders, over 30 million visitors come each year to witness its breathtaking power.',
                    vocabulary: [
                        { word: 'waterfall', meaning: 'n. 瀑布' },
                        { word: 'spectacular', meaning: 'adj. 壮观的' },
                        { word: 'natural wonder', meaning: '自然奇观' },
                        { word: 'border', meaning: 'n. 边界' },
                        { word: 'breathtaking', meaning: 'adj. 令人叹为观止的' }
                    ]
                },
                {
                    title: 'Banff National Park',
                    location: 'Alberta, Canada',
                    description: 'Banff National Park is Canada\'s oldest national park, established in 1885. Located in the Rocky Mountains, it is famous for its turquoise lakes, mountain peaks, and abundant wildlife including bears, elk, and bighorn sheep.',
                    vocabulary: [
                        { word: 'turquoise', meaning: 'adj./n. 绿松石色' },
                        { word: 'abundant', meaning: 'adj. 丰富的' },
                        { word: 'glacier', meaning: 'n. 冰川' },
                        { word: 'wilderness', meaning: 'n. 荒野' },
                        { word: 'scenic', meaning: 'adj. 风景优美的' }
                    ]
                },
                {
                    title: 'The CN Tower',
                    location: 'Toronto, Canada',
                    description: 'The CN Tower is a 553-metre concrete communications and observation tower in Toronto. Once the world\'s tallest free-standing structure, it offers breathtaking views of the city and Lake Ontario from its revolving restaurant and glass floor.',
                    vocabulary: [
                        { word: 'concrete', meaning: 'n./adj. 混凝土' },
                        { word: 'observation', meaning: 'n. 观测' },
                        { word: 'free-standing', meaning: 'adj. 独立式的' },
                        { word: 'structure', meaning: 'n. 建筑结构' },
                        { word: 'skyline', meaning: 'n. 天际线' }
                    ]
                }
            ]
        },
        {
            id: 'ireland',
            country: 'Ireland',
            countryCN: '爱尔兰',
            flag: '🇮🇪',
            countryVideo: { bvid: 'BV1oZ421T7We' },
            attractions: [
                {
                    title: 'The Cliffs of Moher',
                    location: 'County Clare, Ireland',
                    description: 'The Cliffs of Moher are sea cliffs at the southwestern edge of the Burren region. Rising 214 metres above the Atlantic Ocean, they are one of Ireland\'s most spectacular natural attractions and a UNESCO Global Geopark.',
                    vocabulary: [
                        { word: 'cliff', meaning: 'n. 悬崖' },
                        { word: 'rugged', meaning: 'adj. 崎岖的' },
                        { word: 'coastline', meaning: 'n. 海岸线' },
                        { word: 'breathtaking', meaning: 'adj. 令人惊叹的' },
                        { word: 'habitat', meaning: 'n. 栖息地' }
                    ]
                },
                {
                    title: 'Trinity College Dublin',
                    location: 'Dublin, Ireland',
                    description: 'Trinity College Dublin, founded in 1592, is Ireland\'s oldest university. Its Long Room Library houses the famous Book of Kells, a beautifully illustrated manuscript created by Celtic monks around the year 800.',
                    vocabulary: [
                        { word: 'founded', meaning: 'v. 创办' },
                        { word: 'manuscript', meaning: 'n. 手稿' },
                        { word: 'illustrated', meaning: 'adj. 有插图的' },
                        { word: 'scholar', meaning: 'n. 学者' },
                        { word: 'monk', meaning: 'n. 修道士' }
                    ]
                },
                {
                    title: 'The Giant\'s Causeway',
                    location: 'County Antrim, Northern Ireland',
                    description: 'The Giant\'s Causeway is an area of about 40,000 interlocking basalt columns, the result of an ancient volcanic eruption. It is the only UNESCO World Heritage Site in Northern Ireland and is steeped in myth and legend.',
                    vocabulary: [
                        { word: 'interlocking', meaning: 'adj. 互锁的' },
                        { word: 'basalt', meaning: 'n. 玄武岩' },
                        { word: 'column', meaning: 'n. 柱子' },
                        { word: 'volcanic', meaning: 'adj. 火山的' },
                        { word: 'legend', meaning: 'n. 传说' }
                    ]
                }
            ]
        },
        {
            id: 'newzealand',
            country: 'New Zealand',
            countryCN: '新西兰',
            flag: '🇳🇿',
            countryVideo: { bvid: 'BV13qsEeZEgD' },
            attractions: [
                {
                    title: 'Milford Sound',
                    location: 'South Island, New Zealand',
                    description: 'Milford Sound is a fiord in the southwest of New Zealand\'s South Island. Known for its towering Mitre Peak and stunning natural beauty, Rudyard Kipling once called it the "eighth wonder of the world."',
                    vocabulary: [
                        { word: 'fiord', meaning: 'n. 峡湾' },
                        { word: 'towering', meaning: 'adj. 高耸的' },
                        { word: 'stunning', meaning: 'adj. 绝美的' },
                        { word: 'glacier', meaning: 'n. 冰川' },
                        { word: 'rainforest', meaning: 'n. 雨林' }
                    ]
                },
                {
                    title: 'Hobbiton Movie Set',
                    location: 'Matamata, New Zealand',
                    description: 'Hobbiton is the movie set used for The Lord of the Rings and The Hobbit film trilogies. Located on a 1,250-acre sheep farm, it has become one of New Zealand\'s most popular tourist destinations, attracting fans from around the world.',
                    vocabulary: [
                        { word: 'movie set', meaning: 'n. 电影布景' },
                        { word: 'destination', meaning: 'n. 目的地' },
                        { word: 'fictional', meaning: 'adj. 虚构的' },
                        { word: 'picturesque', meaning: 'adj. 如画的' },
                        { word: 'trilogy', meaning: 'n. 三部曲' }
                    ]
                },
                {
                    title: 'Queenstown',
                    location: 'Otago, New Zealand',
                    description: 'Queenstown is a resort town on New Zealand\'s South Island, known as the adventure capital of the world. Surrounded by mountains and Lake Wakatipu, it offers bungee jumping, skydiving, and skiing, making it a paradise for thrill-seekers.',
                    vocabulary: [
                        { word: 'resort', meaning: 'n. 度假胜地' },
                        { word: 'adventure', meaning: 'n. 冒险' },
                        { word: 'bungee jumping', meaning: '蹦极' },
                        { word: 'thrill-seeker', meaning: 'n. 追求刺激者' },
                        { word: 'paradise', meaning: 'n. 天堂' }
                    ]
                }
            ]
        }
    ],

    // ---- 经典英文电影（2部） ----
    movies: [
        {
            id: 'up',
            title: 'Up',
            titleCN: '飞屋环游记',
            year: 2009,
            poster: '🎈🏠',
            aid: 281164330,
            cid: 1339621003,
            bilibiliUrl: 'https://www.bilibili.com/bangumi/play/ep788605',
            description: '78岁的老人卡尔用上万只气球让房子飞了起来，踏上了前往南美洲"仙境瀑布"的冒险之旅。途中意外带上8岁的小男孩罗素，两人一起经历了惊险又温暖的旅程。电影主题与本站"环游世界"完美契合——冒险、旅行、探索未知。',
            whyLearn: '语言简单清晰，对话贴近生活，非常适合高中生练习听力。卡尔和罗素的对话涵盖了日常交流、表达情感、描述风景等实用场景。',
            vocabulary: [
                { word: 'adventure', meaning: 'n. 冒险' },
                { word: 'wilderness', meaning: 'n. 荒野' },
                { word: 'explorer', meaning: 'n. 探险家' },
                { word: 'promise', meaning: 'n./v. 承诺' },
                { word: 'paradise', meaning: 'n. 天堂/乐土' },
                { word: 'spirit of adventure', meaning: '冒险精神' },
                { word: 'cross your heart', meaning: '发誓/保证' },
                { word: 'let go', meaning: '放手/放下' }
            ],
            famousLine: '"Adventure is out there!" — Ellie',
            famousLineCN: '"冒险就在外面等着你！" — 艾丽'
        },
        {
            id: 'zootopia',
            title: 'Zootopia',
            titleCN: '疯狂动物城',
            year: 2016,
            poster: '🦊🐰',
            aid: 619048226,
            cid: 34252784381,
            bilibiliUrl: 'https://www.bilibili.com/bangumi/play/ep777105',
            description: '兔子朱迪从小梦想成为警察，在动物城她遇到了狐狸尼克，两人搭档破获了一桩神秘案件。电影讲述了一个关于梦想、偏见与勇气的故事——"Anyone can be anything."',
            whyLearn: '对话语速适中，发音清晰标准（美式英语），包含大量日常用语和地道表达。动物角色的不同口音也能帮助学生感受英语的多样性。',
            vocabulary: [
                { word: 'stereotype', meaning: 'n. 刻板印象' },
                { word: 'determination', meaning: 'n. 决心' },
                { word: 'prejudice', meaning: 'n. 偏见' },
                { word: 'persevere', meaning: 'v. 坚持不懈' },
                { word: 'diversity', meaning: 'n. 多样性' },
                { word: 'try everything', meaning: '尝试一切' },
                { word: 'make the world a better place', meaning: '让世界更美好' },
                { word: 'don\'t give up', meaning: '别放弃' }
            ],
            famousLine: '"Anyone can be anything." — Judy Hopps',
            famousLineCN: '"任何人都可以成为任何样子。" — 朱迪·霍普斯'
        }
    ],

    // ---- 口语练习句子（30句） ----
    speakingSentences: [
        {
            english: "I'd love to travel around the world and experience different cultures.",
            chinese: "我很想环游世界，体验不同的文化。",
            phonetic: "/aɪd lʌv tuː ˈtrævl əˈraʊnd ðə wɜːrld ænd ɪkˈspɪriəns ˈdɪfrənt ˈkʌltʃərz/"
        },
        {
            english: "Could you recommend some must-see attractions in London?",
            chinese: "你能推荐一些伦敦必看的景点吗？",
            phonetic: "/kʊd juː ˌrekəˈmend sʌm mʌst-siː əˈtrækʃənz ɪn ˈlʌndən/"
        },
        {
            english: "Big Ben is one of the most famous landmarks in the United Kingdom.",
            chinese: "大本钟是英国最著名的地标之一。",
            phonetic: "/bɪɡ ben ɪz wʌn əv ðə moʊst ˈfeɪməs ˈlændmɑːrks ɪn ðə juːˈnaɪtɪd ˈkɪŋdəm/"
        },
        {
            english: "We spent three days exploring the ancient city of Edinburgh.",
            chinese: "我们花了三天时间探索古城爱丁堡。",
            phonetic: "/wiː spent θriː deɪz ɪkˈsplɔːrɪŋ ði ˈeɪnʃənt ˈsɪti əv ˈedɪnbərə/"
        },
        {
            english: "I prefer travelling by train because I can enjoy the scenery along the way.",
            chinese: "我更喜欢乘火车旅行，因为可以欣赏沿途的风景。",
            phonetic: "/aɪ prɪˈfɜːr ˈtrævlɪŋ baɪ treɪn bɪˈkɒz aɪ kæn ɪnˈdʒɔɪ ðə ˈsiːnəri əˈlɒŋ ðə weɪ/"
        },
        {
            english: "Don't forget to bring your passport when you travel abroad.",
            chinese: "出国旅行时别忘了带护照。",
            phonetic: "/doʊnt fərˈɡet tuː brɪŋ jɔːr ˈpæspɔːrt wen juː ˈtrævl əˈbrɔːd/"
        },
        {
            english: "The Grand Canyon is considered one of the Seven Natural Wonders of the World.",
            chinese: "大峡谷被认为是世界七大自然奇观之一。",
            phonetic: "/ðə ɡrænd ˈkænjən ɪz kənˈsɪdərd wʌn əv ðə ˈsevn ˈnætʃərəl ˈwʌndərz əv ðə wɜːrld/"
        },
        {
            english: "It's a good idea to learn some basic phrases before visiting a foreign country.",
            chinese: "去外国之前学一些基本短语是个好主意。",
            phonetic: "/ɪts ə ɡʊd aɪˈdiːə tuː lɜːrn sʌm ˈbeɪsɪk freɪzɪz bɪˈfɔːr ˈvɪzɪtɪŋ ə ˈfɒrən ˈkʌntri/"
        },
        {
            english: "The Sydney Opera House is recognised as a masterpiece of 20th-century architecture.",
            chinese: "悉尼歌剧院被认为是20世纪建筑的杰作。",
            phonetic: "/ðə ˈsɪdni ˈɒpərə haʊs ɪz ˈrekəɡnaɪzd æz ə ˈmɑːstəpiːs əv ˈtwentiəθ ˈsentʃəri ˈɑːkɪtektʃər/"
        },
        {
            english: "Travelling not only broadens our horizons but also helps us understand different ways of life.",
            chinese: "旅行不仅开阔我们的视野，还帮助我们理解不同的生活方式。",
            phonetic: "/ˈtrævlɪŋ nɒt ˈoʊnli ˈbrɔːdnz ˈaʊər həˈraɪznz bʌt ˈɔːlsəʊ helps ʌs ˌʌndərˈstænd ˈdɪfrənt weɪz əv laɪf/"
        },
        {
            english: "Niagara Falls is one of the most spectacular natural wonders I have ever seen.",
            chinese: "尼亚加拉瀑布是我见过的最壮观的自然奇观之一。",
            phonetic: "/naɪˈæɡərə fɔːlz ɪz wʌn əv ðə moʊst spekˈtækjələr ˈnætʃərəl ˈwʌndərz aɪ hæv ˈevər siːn/"
        },
        {
            english: "The Cliffs of Moher offer breathtaking views of the Atlantic Ocean.",
            chinese: "莫赫悬崖可以欣赏到大西洋令人惊叹的景色。",
            phonetic: "/ðə klɪfs əv ˈmoʊhər ˈɒfər ˈbreθteɪkɪŋ vjuːz əv ði ətˈlæntɪk ˈoʊʃn/"
        },
        {
            english: "The Great Barrier Reef is home to a wide variety of marine life.",
            chinese: "大堡礁是各种海洋生物的家园。",
            phonetic: "/ðə ɡreɪt ˈbæriər riːf ɪz hoʊm tuː ə waɪd vəˈraɪəti əv məˈriːn laɪf/"
        },
        {
            english: "I wish I could visit New Zealand and see the beautiful fjords there.",
            chinese: "我希望我能去新西兰看看那里美丽的峡湾。",
            phonetic: "/aɪ wɪʃ aɪ kʊd ˈvɪzɪt njuː ˈziːlənd ænd siː ðə ˈbjuːtəfl fjɔːrdz ðer/"
        },
        {
            english: "What impressed me most was the friendliness of the local people.",
            chinese: "给我印象最深的是当地人的友好。",
            phonetic: "/wɒt ɪmˈprest miː moʊst wɒz ðə ˈfrendlinəs əv ðə ˈloʊkl ˈpiːpl/"
        },
        {
            english: "Could you tell me where the nearest tourist information centre is?",
            chinese: "你能告诉我最近的旅游信息中心在哪里吗？",
            phonetic: "/kʊd juː tel miː weər ðə ˈnɪrəst ˈtʊrɪst ˌɪnfərˈmeɪʃn ˈsentər ɪz/"
        },
        {
            english: "I'd like to rent a car for three days. How much does it cost per day?",
            chinese: "我想租一辆车用三天，每天多少钱？",
            phonetic: "/aɪd laɪk tuː rent ə kɑːr fɔːr θriː deɪz. haʊ mʌtʃ dʌz ɪt kɔːst pɜːr deɪ/"
        },
        {
            english: "Is there a guided tour available in English?",
            chinese: "有英语导游服务吗？",
            phonetic: "/ɪz ðeər ə ˈɡaɪdɪd tʊr əˈveɪləbl ɪn ˈɪŋɡlɪʃ/"
        },
        {
            english: "The sunset view from the top of the mountain was absolutely stunning.",
            chinese: "从山顶看到的日落景色绝对令人惊叹。",
            phonetic: "/ðə ˈsʌnset vjuː frəm ðə tɒp əv ðə ˈmaʊntən wɒz ˈæbsəluːtli ˈstʌnɪŋ/"
        },
        {
            english: "Make sure you try the local cuisine when you visit that city.",
            chinese: "去那个城市一定要尝尝当地美食。",
            phonetic: "/meɪk ʃʊr juː traɪ ðə ˈloʊkl kwɪˈziːn wen juː ˈvɪzɪt ðæt ˈsɪti/"
        },
        {
            english: "We had an amazing time snorkelling in the crystal-clear waters of the Great Barrier Reef.",
            chinese: "我们在大堡礁清澈的水域浮潜，度过了美妙的时光。",
            phonetic: "/wiː hæd ən əˈmeɪzɪŋ taɪm ˈsnɔːrkəlɪŋ ɪn ðə ˈkrɪstl-klɪr ˈwɔːtərz əv ðə ɡreɪt ˈbæriər riːf/"
        },
        {
            english: "Could you help me fill out this customs declaration form?",
            chinese: "你能帮我填写这张海关申报表吗？",
            phonetic: "/kʊd juː help miː fɪl aʊt ðɪs ˈkʌstəmz ˌdekləˈreɪʃn fɔːrm/"
        },
        {
            english: "The architecture in the old town dates back to the 15th century.",
            chinese: "老城区的建筑可以追溯到15世纪。",
            phonetic: "/ði ˈɑːrkɪtektʃər ɪn ði oʊld taʊn deɪts bæk tuː ðə ˌfɪfˈtiːnθ ˈsentʃəri/"
        },
        {
            english: "I got lost on my way to the hotel, but a friendly local helped me find the way.",
            chinese: "我在去酒店的路上迷路了，一个友善的当地人帮我找到了路。",
            phonetic: "/aɪ ɡɒt lɒst ɒn maɪ weɪ tuː ðə hoʊˈtel, bʌt ə ˈfrendli ˈloʊkl helpt miː faɪnd ðə weɪ/"
        },
        {
            english: "Is it safe to walk around the city centre at night?",
            chinese: "晚上在市中心散步安全吗？",
            phonetic: "/ɪz ɪt seɪf tuː wɔːk əˈraʊnd ðə ˈsɪti ˈsentər æt naɪt/"
        },
        {
            english: "The highlight of my trip was definitely watching the sunrise over the Grand Canyon.",
            chinese: "我这次旅行的亮点绝对是在大峡谷看日出。",
            phonetic: "/ðə ˈhaɪlaɪt əv maɪ trɪp wɒz ˈdefɪnətli ˈwɒtʃɪŋ ðə ˈsʌnraɪz ˈoʊvər ðə ɡrænd ˈkænjən/"
        },
        {
            english: "Could you recommend a good place to buy souvenirs?",
            chinese: "你能推荐一个买纪念品的好地方吗？",
            phonetic: "/kʊd juː ˌrekəˈmend ə ɡʊd pleɪs tuː baɪ ˌsuːvəˈnɪrz/"
        },
        {
            english: "The weather was perfect for a day out exploring the ancient ruins.",
            chinese: "天气非常适合外出探索古代遗迹。",
            phonetic: "/ðə ˈweðər wɒz ˈpɜːrfɪkt fɔːr ə deɪ aʊt ɪkˈsplɔːrɪŋ ði ˈeɪnʃənt ˈruːɪnz/"
        },
        {
            english: "I was deeply impressed by the rich cultural heritage of this city.",
            chinese: "这座城市丰富的文化遗产给我留下了深刻印象。",
            phonetic: "/aɪ wɒz ˈdiːpli ɪmˈprest baɪ ðə rɪtʃ ˈkʌltʃərəl ˈherɪtɪdʒ əv ðɪs ˈsɪti/"
        },
        {
            english: "If you plan to travel during peak season, you'd better book your tickets in advance.",
            chinese: "如果你打算在旺季出行，最好提前订票。",
            phonetic: "/ɪf juː plæn tuː ˈtrævl ˈdjʊrɪŋ piːk ˈsiːzn, juːd ˈbetər bʊk jɔːr ˈtɪkɪts ɪn ədˈvæns/"
        }
    ],

    // ---- 口语对话填空（2组） ----
    dialogueExercise: {
        title: "At the Travel Agency",
        lines: [
            { speaker: 'A', text: "Good morning! I'd like to book a {0} to London, please.", blanks: [{ index: 0, answer: "flight" }] },
            { speaker: 'B', text: "Certainly! When would you like to {0}?", blanks: [{ index: 0, answer: "depart" }] },
            { speaker: 'A', text: "I'm planning to leave on July 15th and {0} on July 22nd.", blanks: [{ index: 0, answer: "return" }] },
            { speaker: 'B', text: "Would you prefer a {0} flight or an economy class ticket?", blanks: [{ index: 0, answer: "business" }] },
            { speaker: 'A', text: "Economy class, please. How much is the {0}?", blanks: [{ index: 0, answer: "fare" }] },
            { speaker: 'B', text: "It's $680 for a round trip. Shall I also book a {0} for you?", blanks: [{ index: 0, answer: "hotel" }] },
            { speaker: 'A', text: "Yes, I'd like a hotel near the city {0}.", blanks: [{ index: 0, answer: "centre" }] },
            { speaker: 'B', text: "I can recommend the Grand Hotel. It's within walking {0} of Big Ben.", blanks: [{ index: 0, answer: "distance" }] },
            { speaker: 'A', text: "That sounds {0}! Can I pay by credit card?", blanks: [{ index: 0, answer: "perfect" }] },
            { speaker: 'B', text: "Of course! Your {0} is confirmed. Have a wonderful trip!", blanks: [{ index: 0, answer: "reservation" }] }
        ]
    },

    dialogueExercise2: {
        title: "Asking for Directions While Travelling",
        lines: [
            { speaker: 'A', text: "Excuse me, could you tell me how to get to the nearest {0}?", blanks: [{ index: 0, answer: "station" }] },
            { speaker: 'B', text: "Sure! Go straight ahead and turn left at the second {0}.", blanks: [{ index: 0, answer: "corner" }] },
            { speaker: 'A', text: "Is it far from {0}?", blanks: [{ index: 0, answer: "here" }] },
            { speaker: 'B', text: "No, it's about a ten-minute {0}.", blanks: [{ index: 0, answer: "walk" }] },
            { speaker: 'A', text: "And could you also recommend a good {0} nearby?", blanks: [{ index: 0, answer: "restaurant" }] },
            { speaker: 'B', text: "Yes! The Rose Garden is very {0} with tourists.", blanks: [{ index: 0, answer: "popular" }] },
            { speaker: 'A', text: "What kind of food do they {0}?", blanks: [{ index: 0, answer: "serve" }] },
            { speaker: 'B', text: "They serve traditional English dishes. It's {0} the museum.", blanks: [{ index: 0, answer: "opposite" }] },
            { speaker: 'A', text: "That sounds great! Thanks for your {0}.", blanks: [{ index: 0, answer: "help" }] },
            { speaker: 'B', text: "You're {0}! Enjoy your trip!", blanks: [{ index: 0, answer: "welcome" }] }
        ]
    },

    // ---- 句式练习（30题） ----
    sentenceExercises: [
        {
            english: "I enjoy {0} to different countries during the summer holiday.",
            chinese: "我喜欢在暑假期间去不同的国家旅行。",
            blanks: [{ index: 0, answer: "travelling" }],
            hint: "travel → _______ing"
        },
        {
            english: "The Great Wall is one of the most {0} tourist attractions in China.",
            chinese: "长城是中国最著名的旅游景点之一。",
            blanks: [{ index: 0, answer: "famous" }],
            hint: "著名的"
        },
        {
            english: "It is important {0} learn about local customs before visiting a foreign country.",
            chinese: "在去外国之前了解当地习俗很重要。",
            blanks: [{ index: 0, answer: "to" }],
            hint: "It is important ___ do sth."
        },
        {
            english: "We were {0} by the breathtaking scenery of the Swiss Alps.",
            chinese: "我们被瑞士阿尔卑斯山令人惊叹的景色所吸引。",
            blanks: [{ index: 0, answer: "amazed" }],
            hint: "amaze的过去分词"
        },
        {
            english: "Not only {0} she visit Paris, but she also went to Rome.",
            chinese: "她不仅参观了巴黎，还去了罗马。",
            blanks: [{ index: 0, answer: "did" }],
            hint: "Not only ___ she (倒装句)"
        },
        {
            english: "The trip was so {0} that I will never forget it.",
            chinese: "这次旅行如此令人难忘，我永远不会忘记它。",
            blanks: [{ index: 0, answer: "memorable" }],
            hint: "memory → _______able"
        },
        {
            english: "If I {0} enough money, I would travel around Europe.",
            chinese: "如果我有足够的钱，我会环游欧洲。",
            blanks: [{ index: 0, answer: "had" }],
            hint: "虚拟语气 — If I ___"
        },
        {
            english: "She suggested {0} the museum first before it gets too crowded.",
            chinese: "她建议先去博物馆，免得太挤。",
            blanks: [{ index: 0, answer: "visiting" }],
            hint: "suggest _______ing"
        },
        {
            english: "The hotel {0} we stayed was very comfortable and affordable.",
            chinese: "我们住的酒店既舒适又实惠。",
            blanks: [{ index: 0, answer: "where" }],
            hint: "定语从句 — the hotel ___"
        },
        {
            english: "He has been looking forward to {0} the Sydney Opera House for years.",
            chinese: "他多年来一直期待着参观悉尼歌剧院。",
            blanks: [{ index: 0, answer: "visiting" }],
            hint: "look forward to _______ing"
        },
        {
            english: "Niagara Falls is well {0} visiting if you travel to Canada.",
            chinese: "如果你去加拿大旅行，尼亚加拉瀑布很值得一去。",
            blanks: [{ index: 0, answer: "worth" }],
            hint: "be well ___ doing"
        },
        {
            english: "{0} impressed me most was the friendly attitude of the local people.",
            chinese: "给我印象最深的是当地人的友好态度。",
            blanks: [{ index: 0, answer: "What" }],
            hint: "___ impressed me most (主语从句)"
        },
        {
            english: "The {0} you travel, the more you will learn about the world.",
            chinese: "你旅行得越多，对世界的了解就越多。",
            blanks: [{ index: 0, answer: "more" }],
            hint: "The ___ you travel, the more..."
        },
        {
            english: "I wish I {0} visited more countries when I was younger.",
            chinese: "我希望年轻时能多去几个国家。",
            blanks: [{ index: 0, answer: "had" }],
            hint: "wish + 过去完成时 — I wish I ___ done"
        },
        {
            english: "It was the first time that she {0} travelled abroad by herself.",
            chinese: "这是她第一次独自出国旅行。",
            blanks: [{ index: 0, answer: "had" }],
            hint: "It was the first time that she ___ done (过去完成时)"
        },
        {
            english: "The food in Thailand is {0} delicious that I couldn't stop eating.",
            chinese: "泰国的食物太美味了，我停不下来。",
            blanks: [{ index: 0, answer: "so" }],
            hint: "so ... that ..."
        },
        {
            english: "Travelling by train is more {0} than flying because you can see the scenery.",
            chinese: "乘火车比坐飞机更愉快，因为可以看风景。",
            blanks: [{ index: 0, answer: "enjoyable" }],
            hint: "enjoy → _______able"
        },
        {
            english: "She asked me {0} I had ever been to the Grand Canyon.",
            chinese: "她问我是否去过大峡谷。",
            blanks: [{ index: 0, answer: "whether" }],
            hint: "宾语从句 — 是否"
        },
        {
            english: "It {0} me three hours to get through customs at the airport.",
            chinese: "在机场过海关花了我三个小时。",
            blanks: [{ index: 0, answer: "took" }],
            hint: "It ___ me + time + to do ..."
        },
        {
            english: "The more you practice speaking English, the {0} fluent you will become.",
            chinese: "你练习说英语越多，就会变得越流利。",
            blanks: [{ index: 0, answer: "more" }],
            hint: "the more ... the more ..."
        },
        {
            english: "I was about to leave {0} it started pouring with rain.",
            chinese: "我正要离开，突然下起了倾盆大雨。",
            blanks: [{ index: 0, answer: "when" }],
            hint: "be about to do ... ___ ... (突然)"
        },
        {
            english: "He insisted that we {0} the local market before leaving the city.",
            chinese: "他坚持要我们在离开城市之前参观当地市场。",
            blanks: [{ index: 0, answer: "visit" }],
            hint: "insist that + sb + 动词原形"
        },
        {
            english: "The hotel was so expensive that we {0} afford to stay for more than two nights.",
            chinese: "酒店太贵了，我们住不起超过两晚。",
            blanks: [{ index: 0, answer: "couldn't" }],
            hint: "so ... that ... (否定)"
        },
        {
            english: "It is generally {0} that travelling broadens the mind.",
            chinese: "人们普遍认为旅行能开阔思维。",
            blanks: [{ index: 0, answer: "believed" }],
            hint: "It is generally ___ that ..."
        },
        {
            english: "Had I {0} about the delay earlier, I wouldn't have arrived at the airport so early.",
            chinese: "如果我早知道延误的话，我就不会这么早到机场了。",
            blanks: [{ index: 0, answer: "known" }],
            hint: "Had I ___ ... (虚拟语气倒装)"
        },
        {
            english: "The small village {0} among the mountains is a hidden gem for travelers.",
            chinese: "坐落于群山之中的小村庄是旅行者的隐藏宝地。",
            blanks: [{ index: 0, answer: "located" }],
            hint: "过去分词作定语 — ___ among"
        },
        {
            english: "I wish I {0} more time to explore the countryside during the trip.",
            chinese: "我希望旅行时有更多时间探索乡村。",
            blanks: [{ index: 0, answer: "had" }],
            hint: "wish + 虚拟 — I wish I ___"
        },
        {
            english: "Only after we arrived at the station {0} we realize the train had been cancelled.",
            chinese: "我们到了车站才发现火车被取消了。",
            blanks: [{ index: 0, answer: "did" }],
            hint: "Only + 状语 + 倒装 — ___ we ..."
        },
        {
            english: "There is no {0} that travel is the best form of education.",
            chinese: "毫无疑问旅行是最好的教育形式。",
            blanks: [{ index: 0, answer: "doubt" }],
            hint: "There is no ___ that ..."
        },
        {
            english: "They are considering {0} a direct flight to Rome next summer.",
            chinese: "他们在考虑明年夏天乘坐直飞航班去罗马。",
            blanks: [{ index: 0, answer: "taking" }],
            hint: "consider _______ing"
        }
    ],

    // ---- 词汇闪卡（旅游主题 30 词） ----
    vocabularyCards: [
        // 交通出行
        { word: 'book a flight', meaning: '预订航班', pronunciation: '/bʊk ə flaɪt/', example: 'I want to book a flight to London.' },
        { word: 'boarding pass', meaning: '登机牌', pronunciation: '/ˈbɔːrdɪŋ pæs/', example: 'Show your boarding pass at the gate.' },
        { word: 'departure', meaning: 'n. 出发', pronunciation: '/dɪˈpɑːrtʃər/', example: 'The departure time is 3:00 PM.' },
        { word: 'arrival', meaning: 'n. 到达', pronunciation: '/əˈraɪvl/', example: 'The arrival gate is Number 8.' },
        { word: 'round trip', meaning: '往返旅程', pronunciation: '/raʊnd trɪp/', example: 'A round trip ticket is cheaper.' },
        { word: 'passport', meaning: 'n. 护照', pronunciation: '/ˈpæspɔːrt/', example: 'Don\'t forget your passport.' },
        { word: 'visa', meaning: 'n. 签证', pronunciation: '/ˈviːzə/', example: 'Do I need a visa to visit Canada?' },
        { word: 'jet lag', meaning: 'n. 时差反应', pronunciation: '/dʒet læɡ/', example: 'I have serious jet lag after the long flight.' },
        { word: 'aisle seat', meaning: '靠过道座位', pronunciation: '/aɪl siːt/', example: 'I prefer an aisle seat.' },
        { word: 'luggage', meaning: 'n. 行李', pronunciation: '/ˈlʌɡɪdʒ/', example: 'How many pieces of luggage do you have?' },

        // 住宿
        { word: 'check in', meaning: '办理入住', pronunciation: '/tʃek ɪn/', example: 'We can check in after 2:00 PM.' },
        { word: 'check out', meaning: '退房', pronunciation: '/tʃek aʊt/', example: 'Check out time is before 11:00 AM.' },
        { word: 'reservation', meaning: 'n. 预订', pronunciation: '/ˌrezərˈveɪʃn/', example: 'I have a reservation under the name Wang.' },
        { word: 'single room', meaning: '单人间', pronunciation: '/ˈsɪŋɡl ruːm/', example: 'A single room with a balcony, please.' },
        { word: 'bed & breakfast', meaning: '民宿/含早餐旅馆', pronunciation: '/bed ænd ˈbrekfəst/', example: 'We stayed at a lovely bed & breakfast.' },

        // 观光
        { word: 'scenery', meaning: 'n. 风景', pronunciation: '/ˈsiːnəri/', example: 'The scenery along the coast is breathtaking.' },
        { word: 'sightseeing', meaning: 'n. 观光', pronunciation: '/ˈsaɪtsiːɪŋ/', example: 'We spent the day sightseeing in the city.' },
        { word: 'tourist attraction', meaning: '旅游景点', pronunciation: '/ˈtʊrɪst əˈtrækʃn/', example: 'Big Ben is a famous tourist attraction.' },
        { word: 'local delicacy', meaning: '当地美食', pronunciation: '/ˈloʊkl ˈdelɪkəsi/', example: 'Try the local delicacies when you visit.' },
        { word: 'souvenir', meaning: 'n. 纪念品', pronunciation: '/ˌsuːvəˈnɪr/', example: 'I bought a souvenir for my sister.' },

        // 实用动词短语
        { word: 'get around', meaning: '四处走动/出行', pronunciation: '/ɡet əˈraʊnd/', example: 'What\'s the best way to get around the city?' },
        { word: 'look forward to', meaning: '期待', pronunciation: '/lʊk ˈfɔːrwərd tu/', example: 'I look forward to visiting the Great Wall.' },
        { word: 'go sightseeing', meaning: '去观光', pronunciation: '/ɡoʊ ˈsaɪtsiːɪŋ/', example: 'We plan to go sightseeing tomorrow.' },
        { word: 'take photos', meaning: '拍照', pronunciation: '/teɪk ˈfoʊtoʊz/', example: 'Can I take photos here?' },
        { word: 'try local food', meaning: '品尝当地食物', pronunciation: '/traɪ ˈloʊkl fuːd/', example: 'You should try the local food.' },

        // 高级表达
        { word: 'itinerary', meaning: 'n. 行程安排', pronunciation: '/aɪˈtɪnəreri/', example: 'Can you send me the itinerary?' },
        { word: 'budget', meaning: 'n./adj. 预算', pronunciation: '/ˈbʌdʒɪt/', example: 'We\'re travelling on a tight budget.' },
        { word: 'pack', meaning: 'v. 收拾行李', pronunciation: '/pæk/', example: 'I haven\'t packed yet.' },
        { word: 'explore', meaning: 'v. 探索', pronunciation: '/ɪkˈsplɔːr/', example: 'Let\'s explore the old town.' }
    ],

    // ---- 语法练习（30 题，选择题） ----
    grammarExercises: [
        {
            question: 'I would rather ______ by train than by plane.',
            options: ['travel', 'to travel', 'travelling', 'travelled'],
            answer: 0,
            explanation: 'would rather + 动词原形，表示"宁愿做某事"。'
        },
        {
            question: 'By the time we arrived, the train ______.',
            options: ['left', 'has left', 'had left', 'leaves'],
            answer: 2,
            explanation: 'by the time + 过去时间，主句用过去完成时。'
        },
        {
            question: 'This is the hotel ______ we stayed last summer.',
            options: ['where', 'which', 'what', 'when'],
            answer: 0,
            explanation: '先行词是地点，定语从句用 where 或 in which。'
        },
        {
            question: '______ is known to all, travelling enriches our lives.',
            options: ['It', 'As', 'What', 'That'],
            answer: 1,
            explanation: 'as 引导非限制性定语从句，表示"正如……"。'
        },
        {
            question: 'If I ______ about the typhoon, I would have stayed at home.',
            options: ['knew', 'had known', 'would know', 'have known'],
            answer: 1,
            explanation: '与过去事实相反的虚拟语气：If + had done, 主句 would have done。'
        },
        {
            question: 'The Great Wall is well ______ visiting.',
            options: ['worth', 'worthy', 'worthwhile', 'worth of'],
            answer: 0,
            explanation: 'be worth doing 是固定搭配，主动表被动。'
        },
        {
            question: 'Not only ______ to London, but she also visited Paris.',
            options: ['she went', 'did she go', 'she goes', 'goes she'],
            answer: 1,
            explanation: 'not only 置于句首时，主谓要部分倒装。'
        },
        {
            question: 'Travelling ______ good for both body and mind.',
            options: ['are', 'is', 'were', 'be'],
            answer: 1,
            explanation: '动名词 travelling 作主语，谓语动词用单数。'
        },
        {
            question: 'I have no idea ______ he will come back.',
            options: ['when', 'that', 'which', 'where'],
            answer: 0,
            explanation: '同位语从句，idea 的内容是"他什么时候回来"。'
        },
        {
            question: 'The book ______ by the window is mine.',
            options: ['laying', 'lain', 'lay', 'lying'],
            answer: 3,
            explanation: 'lie（躺/位于）的现在分词是 lying，此处作后置定语。'
        },
        {
            question: 'It is the first time that I ______ abroad.',
            options: ['have been', 'had been', 'was', 'am'],
            answer: 0,
            explanation: 'It is the first time that + 现在完成时。'
        },
        {
            question: '______ the bad weather, we had to cancel the trip.',
            options: ['Because', 'Because of', 'As', 'Since'],
            answer: 1,
            explanation: 'because of + 名词短语；because + 句子。'
        },
        {
            question: 'The city ______ we visited last year has changed a lot.',
            options: ['where', 'when', 'which', 'whose'],
            answer: 2,
            explanation: 'visited 是及物动词，缺宾语，用 which/that。'
        },
        {
            question: 'She suggested ______ the museum first.',
            options: ['to visit', 'visiting', 'visit', 'visited'],
            answer: 1,
            explanation: 'suggest + doing，建议做某事。'
        },
        {
            question: '______ in the countryside, I found the trip very relaxing.',
            options: ['Having grown up', 'Grow up', 'Grown up', 'To grow up'],
            answer: 0,
            explanation: '现在分词完成式作原因状语，表示动作先发生。'
        },
        {
            question: 'There is no point ______ about the cancelled trip. Let\'s plan another one.',
            options: ['worrying', 'to worry', 'in worrying', 'worried'],
            answer: 2,
            explanation: 'There is no point in doing sth. 固定搭配，表示"做某事没有意义"。'
        },
        {
            question: '______ hard he tried, he could not catch the last train to York.',
            options: ['Whatever', 'However', 'No matter', 'Although'],
            answer: 1,
            explanation: 'However + adj./adv. + 主谓 = No matter how + adj./adv. + 主谓。'
        },
        {
            question: 'The flight tickets ______ online are usually much cheaper.',
            options: ['booked', 'booking', 'are booked', 'have booked'],
            answer: 0,
            explanation: '过去分词作后置定语，tickets 和 book 之间是被动关系。'
        },
        {
            question: 'She kept the trip a secret ______ she could surprise her family with the news.',
            options: ['so that', 'because of', 'in order to', 'even if'],
            answer: 0,
            explanation: 'so that 引导目的状语从句，表示"为了/以便"。because of 后只能跟名词。'
        },
        {
            question: 'The number of international tourists ______ significantly over the past decade.',
            options: ['increased', 'has increased', 'have increased', 'was increasing'],
            answer: 1,
            explanation: 'the number of + n. 作主语，谓语用单数；over the past decade 搭配现在完成时。'
        },
        {
            question: 'He is said ______ to more than thirty countries around the world.',
            options: ['to travel', 'to have travelled', 'travelling', 'to be travelling'],
            answer: 1,
            explanation: 'be said to have done 表示"据说已经做过某事"，动作已发生。'
        },
        {
            question: 'This is the third time that I ______ this beautiful city.',
            options: ['visited', 'have visited', 'had visited', 'visit'],
            answer: 1,
            explanation: 'This/It is the + 序数词 + time that + 现在完成时。'
        },
        {
            question: 'They had a wonderful time in Paris, ______ they said was the best trip ever.',
            options: ['where', 'which', 'what', 'that'],
            answer: 1,
            explanation: 'which 引导非限制性定语从句，指代前面整个句子或 trip。'
        },
        {
            question: 'It won\'t be long ______ the summer vacation comes round again.',
            options: ['since', 'before', 'when', 'after'],
            answer: 1,
            explanation: 'It won\'t be long before... 表示"不久就会……"。'
        },
        {
            question: 'There used to ______ a small tea house at the foot of the mountain.',
            options: ['have', 'be', 'being', 'having'],
            answer: 1,
            explanation: 'There used to be... 表示"过去曾有……"。used to + 动词原形。'
        },
        {
            question: 'The scenery was so beautiful that it was beyond ______.',
            options: ['describing', 'description', 'describe', 'described'],
            answer: 1,
            explanation: 'beyond description 固定搭配，表示"难以描述"。'
        },
        {
            question: 'I would appreciate ______ if you could recommend a good restaurant nearby.',
            options: ['you', 'that', 'it', 'this'],
            answer: 2,
            explanation: 'I would appreciate it if... 固定句型，it 作形式宾语。'
        },
        {
            question: 'With so many places ______, we decided to extend our stay by two days.',
            options: ['to visit', 'visiting', 'visited', 'being visited'],
            answer: 0,
            explanation: 'with + n. + to do，不定式表示将要发生的动作。'
        },
        {
            question: '______ from the top of the hill, the entire city looks breathtaking at night.',
            options: ['Seeing', 'Seen', 'To see', 'Having seen'],
            answer: 1,
            explanation: '过去分词作状语，主语 the city 与 see 是被动关系。'
        }
    ],

    // ---- 听力练习（30 题，每题一段对话 + 问题） ----
    listeningExercises: [
        {
            audio_text: "Excuse me, could you tell me how to get to the nerest underground station?\nSure! Go straight ahead and turn left at the second corner. It's just across from the post office.",
            question: 'Where is the underground station?',
            options: ['Next to the post office', 'Opposite the post office', 'Behind the post office', 'Inside the post office'],
            answer: 1,
            script: '打扰一下，你能告诉我最近的地铁站怎么走吗？\n当然！直走然后在第二个路口左转。就在邮局对面。'
        },
        {
            audio_text: "Have you booked the hotel yet?\nYes, I booked a double room at the Dragon Hotel for three nights, check-in is on Monday.",
            question: 'How many nights will the woman stay at the hotel?',
            options: ['One night', 'Two nights', 'Three nights', 'Four nights'],
            answer: 2,
            script: '你订酒店了吗？\n订了，我在龙酒店订了一个双人间，住三晚，周一入住。'
        },
        {
            audio_text: "Would you like to go to the art exhibition with me tomorow?\nI\'d love to, but I have to see my cousin off at the airport. He\'s flying to Sydney.",
            question: 'What will the man do tomorrow?',
            options: ['Go to the art exhibition', 'Meet his cousin at the airport', 'See his cousin off at the airport', 'Pick up his cousin'],
            answer: 2,
            script: '你明天想和我一起去艺术展吗？\n我很想去，但我得去机场送我表弟。他坐飞机去悉尼。'
        },
        {
            audio_text: "How was your trip to Scotland?\nIt was amazing! The scenery was breathtaking, especially on the way to the Highlands. The only problem was the weather — it rained every day!",
            question: 'What was the weather like in Scotland?',
            options: ['Sunny every day', 'It rained every day', 'It was windy', 'It snowed'],
            answer: 1,
            script: '你的苏格兰之旅怎么样？\n太棒了！风景令人惊叹，尤其是去 Highland 的路上。唯一的问题是天气——每天都下雨！'
        },
        {
            audio_text: "Do I need a visa to visit New Zealand?\nIt depends on your passport. If you hold a Chinese passport, you need to apply for a visa in advance.",
            question: 'What does the man say about the visa?',
            options: ['No visa is needed', 'Visa can be obtained on arrival', 'It depends on the passport', 'New Zealand never requires a visa'],
            answer: 2,
            script: '我去新西兰需要签证吗？\n看你的护照。如果你持中国护照，需要提前申请签证。'
        },
        {
            audio_text: "Which seat would you prefer, window or aisle?\nWindow, please. I love watching the clouds during the flight.",
            question: 'What seat does the woman prefer?',
            options: ['Aisle seat', 'Window seat', 'Middle seat', 'Exit row seat'],
            answer: 1,
            script: '您想要哪种座位，靠窗还是靠过道？\n靠窗，谢谢。我喜欢在飞行中看云。'
        },
        {
            audio_text: "How much does a return ticket to Tokyo cost?\nEconomy class is £580. Business class is £1,850. When would you like to depart?\nI\'ll take the economy one, departing on Friday.",
            question: 'How much did the woman pay for the ticket?',
            options: ['£580', '£1,850', '£580 return', '£1,850 return'],
            answer: 2,
            script: '去东京的往返票多少钱？\n经济舱 580 英镑，商务舱 1850 英镑。您想什么时候出发？\n我要经济舱，周五出发。（return ticket = 往返）'
        },
        {
            audio_text: "I heard you went to Ireand last month.\nYes, we drove around the whole country! The Cliffs of Moher were the most impressive. The photos don\'t do it justice.",
            question: 'What does the woman say about the Cliffs of Moher?',
            options: ['They are not as good as the photos', 'The photos describe them perfectly', 'They are even better than the photos', 'She didn\'t take any photos'],
            answer: 2,
            script: '我听说你上个月去了爱尔兰。\n是的，我们开车环游了全国！莫赫悬崖最令人印象深刻。照片根本拍不出它的美。（do justice = 公正地呈现）'
        },
        {
            audio_text: "Is there a direct flight to San Francisco?\nNo, I\'m afraid you\'ll have to transfer in Shanghai. The total journey takes about 16 hours.",
            question: 'How can the woman get to San Francisco?',
            options: ['Direct flight', 'Transfer in Beijing', 'Transfer in Shanghai', 'By train'],
            answer: 2,
            script: '有直飞旧金山的航班吗？\n没有，您需要在上海转机。全程大约 16 小时。'
        },
        {
            audio_text: "How did you find the food in Thailand?\nIt was delicious but quite spicy! My mouth was on fire after the first bite. I\'m not used to spicy food.",
            question: 'What did the woman think of the food in Thailand?',
            options: ['Too sweet', 'Too spicy', 'Too expensive', 'Not delicious'],
            answer: 1,
            script: '你觉得泰国食物怎么样？\n很美味但是非常辣！第一口下去我嘴里就像着火了一样。我不习惯辣食。'
        },
        {
            audio_text: "What time does the museum open on Saturdays?\nIt opens at 9:30 AM, but the last admission is at 4:00 PM.",
            question: 'What time is the last admission to the museum?',
            options: ['9:30 AM', '4:00 PM', '5:00 PM', '8:00 PM'],
            answer: 1,
            script: '博物馆周六几点开门？\n早上9点半开门，但是最后入场是下午4点。'
        },
        {
            audio_text: "I'd like to exchange some dollars for euros, please.\nCertainly. Today's exchange rate is 1 dollar to 0.92 euros. How much would you like to exchange?",
            question: 'What is today\'s exchange rate for dollars to euros?',
            options: ['1 dollar to 0.92 euros', '1 euro to 0.92 dollars', '1 dollar to 0.85 euros', '1 euro to 1 dollar'],
            answer: 0,
            script: '我想把美元换成欧元。\n没问题。今天的汇率是1美元兑0.92欧元。您想换多少？'
        },
        {
            audio_text: "Can I help you with anything?\nYes, I've lost my suitcase. It's a large black one with a red ribbon on the handle.",
            question: 'What has the man lost?',
            options: ['His passport', 'His wallet', 'His suitcase', 'His phone'],
            answer: 2,
            script: '需要帮忙吗？\n是的，我的行李箱丢了。是一个大的黑色的，把手上有条红丝带。'
        },
        {
            audio_text: "Is the train station within walking distance?\nIt's about 20 minutes on foot, but you can take the Number 7 bus and get off at the third stop.",
            question: 'How can the man get to the train station?',
            options: ['Walk for 10 minutes', 'Take the Number 7 bus', 'Take the Number 3 bus', 'Take a taxi'],
            answer: 1,
            script: '火车站能走过去吗？\n步行大约20分钟，不过你可以坐7路公交车在第三站下车。'
        },
        {
            audio_text: "How was your trip to New Zealand?\nIncredible! We went bungee jumping in Queenstown and visited the Hobbiton movie set. The landscapes were even more beautiful than in the movies.",
            question: 'What did the man do in New Zealand?',
            options: ['Went skiing', 'Went bungee jumping', 'Went surfing', 'Went mountain climbing'],
            answer: 1,
            script: '你的新西兰之旅怎么样？\n太棒了！我们在皇后镇蹦极了，还参观了霍比屯电影布景。风景比电影里还要美。'
        },
        {
            audio_text: "I'd like to book a double room with a sea view for the weekend.\nI'm sorry, all sea-view rooms are fully booked. We only have a standard room available.",
            question: 'Why can\'t the man get a sea-view room?',
            options: ['It\'s too expensive', 'They are closed', 'They are fully booked', 'He doesn\'t need one'],
            answer: 2,
            script: '我想预订一间周末的海景双人房。\n不好意思，所有海景房都订满了。我们只剩一间标准房。'
        },
        {
            audio_text: "What's the weather forecast for tomorrow?\nIt's going to be sunny in the morning but cloudy in the afternoon. The temperature will be around 22 degrees Celsius.",
            question: 'What will the weather be like tomorrow morning?',
            options: ['Rainy', 'Cloudy', 'Sunny', 'Windy'],
            answer: 2,
            script: '明天天气预报怎么样？\n上午晴天，下午转阴。气温大约22摄氏度。'
        },
        {
            audio_text: "Excuse me, where can I collect my boarding pass?\nYou can use the self-check-in machines over there, or go to Counter 5 for manual check-in. You'll need your passport and booking reference.",
            question: 'What does the woman say the man needs?',
            options: ['Only a passport', 'Passport and booking reference', 'Credit card', 'Driving license'],
            answer: 1,
            script: '请问在哪里取登机牌？\n您可以用那边的自助值机，或者去5号柜台人工办理。需要护照和预订编号。'
        },
        {
            audio_text: "I heard you went to Canada. Did you see Niagara Falls?\nYes! It was spectacular. The boat tour took us right up to the mist of the falls. It was an unforgettable experience.",
            question: 'How did the man feel about Niagara Falls?',
            options: ['Disappointed', 'Bored', 'Unforgettable', 'Frightened'],
            answer: 2,
            script: '听说你去了加拿大。看到尼亚加拉瀑布了吗？\n看到了！太壮观了。游船带我们直抵瀑布的水雾中。难以忘怀的经历。'
        },
        {
            audio_text: "I'm going to start learning English before my trip to London.\nThat's a good idea! Even knowing some basic phrases will make a big difference.",
            question: 'What is the man going to do?',
            options: ['Learn French', 'Learn English', 'Book a flight', 'Buy a guidebook'],
            answer: 1,
            script: '我打算在去伦敦之前开始学英语。\n好主意！哪怕会几句基本用语都会大有帮助。'
        },
        {
            audio_text: "How far is the nearest subway station from here?\nIt's just a five-minute walk. Go out of the main gate and turn right. You can't miss it - there's a big red sign.",
            question: 'How long does it take to walk to the subway station?',
            options: ['5 minutes', '15 minutes', '25 minutes', '50 minutes'],
            answer: 0,
            script: '最近的地铁站离这里多远？\n走路就五分钟。出大门右转，有个大红色标志，不会错过的。'
        },
        {
            audio_text: "I can't decide whether to go to France or Italy for my summer holiday.\nWhy not visit both? They're next to each other, and the high-speed train only takes about 3 hours from Paris to Milan.",
            question: 'How long does the train take from Paris to Milan?',
            options: ['About 1 hour', 'About 3 hours', 'About 5 hours', 'About 8 hours'],
            answer: 1,
            script: '我决定不了暑假去法国还是意大利。\n为什么不两个都去？他们挨着，从巴黎到米兰的高铁只要大约3小时。'
        },
        {
            audio_text: "The Grand Palace is very crowded today.\nThat's because it's a public holiday in Thailand. Let's come back tomorrow morning when it's less busy.",
            question: 'Why is the Grand Palace so crowded?',
            options: ['It\'s the weekend', 'It\'s a public holiday', 'There\'s a festival', 'It\'s free entry day'],
            answer: 1,
            script: '大皇宫今天人好多。\n因为今天是泰国的公共假期。我们明天早上再来吧，那时候人会少些。'
        },
        {
            audio_text: "Do you have any recommendations for local dishes?\nYou must try the fish and chips at the harbour restaurant. It's the most popular dish among locals and tourists alike.",
            question: 'What dish does the man recommend?',
            options: ['Pizza', 'Fish and chips', 'Steak', 'Seafood salad'],
            answer: 1,
            script: '你有什么当地菜推荐吗？\n你一定要尝尝码头餐厅的炸鱼薯条。那是当地人和游客最喜欢的一道菜。'
        },
        {
            audio_text: "What time should we check out tomorrow?\nCheck-out is by 11:00 AM. If you need a later check-out, please let the front desk know in advance.",
            question: 'When should they check out?',
            options: ['By 10:00 AM', 'By 11:00 AM', 'By 12:00 PM', 'By 1:00 PM'],
            answer: 1,
            script: '明天什么时候退房？\n上午11点之前。如果需要延迟退房，请提前告知前台。'
        },
        {
            audio_text: "Did you enjoy the walking tour in Rome?\nAbsolutely! The guide was very knowledgeable. He told us stories about every ancient building we passed. I learned so much more than if I'd wandered around on my own.",
            question: 'Why did the man enjoy the walking tour?',
            options: ['It was cheap', 'The weather was nice', 'The guide was knowledgeable', 'The group was small'],
            answer: 2,
            script: '罗马的徒步游你喜欢吗？\n非常喜欢！导游知识很渊博。经过的每一座古建筑他都能讲故事。比我一个人乱逛学到的东西多多了。'
        },
        {
            audio_text: "I think I've left my camera in the taxi.\nDon't worry! Do you remember the taxi number or the colour of the car? We can call the taxi company.",
            question: 'What did the man leave in the taxi?',
            options: ['His wallet', 'His phone', 'His camera', 'His bag'],
            answer: 2,
            script: '我好像把相机落在出租车上了。\n别担心！你记得车牌号或者车身颜色吗？我们可以给出租车公司打电话。'
        },
        {
            audio_text: "The flight to Sydney is delayed by three hours due to bad weather.\nThat's frustrating. Is there anything we can do in the meantime? Maybe we could grab something to eat.",
            question: 'Why is the flight delayed?',
            options: ['Mechanical problem', 'Staff shortage', 'Bad weather', 'Airport traffic'],
            answer: 2,
            script: '飞悉尼的航班因恶劣天气延误了三小时。\n真烦人。这段时间我们能做什么？也许可以去吃点东西。'
        },
        {
            audio_text: "How much is an entrance ticket for the Tower of London?\nIt's £29.90 for adults, £14.90 for children under 16, and children under 5 get in free.",
            question: 'How much is the ticket for children under 5?',
            options: ['£14.90', '£29.90', '£10.00', 'Free'],
            answer: 3,
            script: '伦敦塔的门票多少钱？\n成人29.90英镑，16岁以下儿童14.90英镑，5岁以下免费。'
        }
    ],

    // ---- 作文题目 -----
    writingPrompt: {
        title: "应用文写作 — 推荐旅游目的地",
        prompt: `假定你是李华，你的英国笔友Tom来信说他打算暑假来中国旅游，希望你推荐一个城市。请你给他写一封回信，内容包括：<br><br>
<strong>1.</strong> 推荐一个中国城市；<br>
<strong>2.</strong> 说明推荐理由（至少两条）；<br>
<strong>3.</strong> 提供旅行建议。<br><br>
<strong>注意：</strong><br>
1. 词数80左右；<br>
2. 可以适当增加细节，以使行文连贯。`,
        totalScore: 15,
        criteria: {
            content: { name: '内容要点', max: 5, desc: '是否覆盖所有要点，内容是否充实' },
            language: { name: '语言表达', max: 5, desc: '词汇丰富度、语法准确性、句式多样性' },
            coherence: { name: '篇章结构', max: 3, desc: '段落衔接、逻辑连贯、格式规范' },
            innovation: { name: '创新亮点', max: 2, desc: '表达新颖、用词精准、有个人特色' }
        }
    }
};
