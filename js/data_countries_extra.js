/* ===========================================
   六国扩展数据：对话场景 + 阅读素材
   =========================================== */

const COUNTRY_EXTRA = {
    uk: {
        dialogues: [
            {
                id: 'ask_direction_uk',
                title: '问路场景',
                scene: '在伦敦街头，你想去大本钟，向路人询问路线',
                lines: [
                    { speaker: 'A', text: 'Excuse me, could you tell me how to get to {0}?', blanks: [{ index: 0, answer: 'Big Ben' }] },
                    { speaker: 'B', text: 'Sure! Go straight along the Thames, then turn {0} at the second crossroad.', blanks: [{ index: 0, answer: 'right' }] },
                    { speaker: 'A', text: 'Is it {0} from here?', blanks: [{ index: 0, answer: 'far' }] },
                    { speaker: 'B', text: 'No, it\'s about a ten-minute {0}. You can\'t miss it.', blanks: [{ index: 0, answer: 'walk' }] },
                    { speaker: 'A', text: 'Thank you so {0}!', blanks: [{ index: 0, answer: 'much' }] },
                    { speaker: 'B', text: 'You\'re welcome! Enjoy your {0} in London.', blanks: [{ index: 0, answer: 'trip' }] }
                ]
            },
            {
                id: 'order_food_uk',
                title: '点餐场景',
                scene: '在伦敦一家传统英式餐厅，你正在点餐',
                lines: [
                    { speaker: 'A', text: 'Good evening! I\'d like to {0} a table for two, please.', blanks: [{ index: 0, answer: 'book' }] },
                    { speaker: 'B', text: 'Of course. Would you like a {0} by the window?', blanks: [{ index: 0, answer: 'table' }] },
                    { speaker: 'A', text: 'Yes, please. What do you {0}?', blanks: [{ index: 0, answer: 'recommend' }] },
                    { speaker: 'B', text: 'Our fish and {0} is very popular with customers.', blanks: [{ index: 0, answer: 'chips' }] },
                    { speaker: 'A', text: 'That sounds great! And a cup of {0}, please.', blanks: [{ index: 0, answer: 'tea' }] },
                    { speaker: 'B', text: 'Anything {0} for you?', blanks: [{ index: 0, answer: 'else' }] },
                    { speaker: 'A', text: 'No, that\'s all. Thank you very much.', blanks: [] }
                ]
            }
        ],
        reading: {
            title: '伦敦的交通系统',
            passage: 'London has one of the largest and most comprehensive public transportation systems in the world. The London Underground, known locally as "the Tube," is the oldest underground railway in the world, opening in 1863. It has 11 lines and serves 272 stations across the city. The iconic red double-decker buses are another symbol of London, carrying millions of passengers every year. For a more traditional experience, visitors can take a black cab — London\'s famous taxis, driven by drivers who must pass a rigorous test called "The Knowledge." The Thames Clippers river bus service is also popular, offering a scenic way to travel along the River Thames while avoiding traffic on the roads.',
            translation: '伦敦拥有世界上最大、最完善的公共交通系统之一。伦敦地铁，当地人称之为"Tube"，是世界上最古老的地下铁路，于1863年开通。它有11条线路，服务于全城272个车站。标志性的红色双层巴士是伦敦的另一象征，每年运载数百万乘客。为了更传统的体验，游客可以乘坐黑色出租车——伦敦著名的出租车，由必须通过名为"The Knowledge"的严格测试的司机驾驶。泰晤士河快船服务也很受欢迎，提供了沿泰晤士河旅行的观光方式，同时避开了道路上的交通拥堵。',
            vocabulary: [
                { word: 'comprehensive', meaning: 'adj. 全面的' },
                { word: 'Underground', meaning: 'n. 地铁' },
                { word: 'double-decker', meaning: 'n. 双层巴士' },
                { word: 'rigorous', meaning: 'adj. 严格的' },
                { word: 'scenic', meaning: 'adj. 观光的/风景优美的' }
            ],
            questions: [
                { question: 'When did the London Underground open?', options: ['A. 1853', 'B. 1863', 'C. 1873', 'D. 1883'], answer: 1, explanation: 'Mentioned: "The London Underground... opening in 1863."' },
                { question: 'What must London black cab drivers pass?', options: ['A. A driving speed test', 'B. A language test', 'C. "The Knowledge" test', 'D. A first aid test'], answer: 2, explanation: 'Mentioned: "drivers who must pass a rigorous test called The Knowledge."' },
                { question: 'How many stations does the London Underground serve?', options: ['A. 172', 'B. 272', 'C. 372', 'D. 472'], answer: 1, explanation: 'Mentioned: "It has 11 lines and serves 272 stations across the city."' }
            ]
        }
    },
    usa: {
        dialogues: [
            {
                id: 'ask_direction_usa',
                title: '问路场景',
                scene: '在纽约曼哈顿，你想去中央公园，向路人询问路线',
                lines: [
                    { speaker: 'A', text: 'Excuse me, is there a {0} near here?', blanks: [{ index: 0, answer: 'subway' }] },
                    { speaker: 'B', text: 'Yes, the nearest one is just two {0} away.', blanks: [{ index: 0, answer: 'blocks' }] },
                    { speaker: 'A', text: 'Which {0} should I take to get to Central Park?', blanks: [{ index: 0, answer: 'line' }] },
                    { speaker: 'B', text: 'Take the B or C train to 72nd Street. It\'s very {0}.', blanks: [{ index: 0, answer: 'convenient' }] },
                    { speaker: 'A', text: 'Thank you! Do you know how {0} the park is open?', blanks: [{ index: 0, answer: 'late' }] },
                    { speaker: 'B', text: 'It\'s open {0} — 6 a.m. to 1 a.m.', blanks: [{ index: 0, answer: 'daily' }] }
                ]
            },
            {
                id: 'order_food_usa',
                title: '点餐场景',
                scene: '在纽约一家美式餐厅，你正在点汉堡和饮料',
                lines: [
                    { speaker: 'A', text: 'Hi! I\'d like a {0}, please.', blanks: [{ index: 0, answer: 'cheeseburger' }] },
                    { speaker: 'B', text: 'Would you like {0} or sweet potato fries?', blanks: [{ index: 0, answer: 'regular' }] },
                    { speaker: 'A', text: 'Regular fries, please. And a {0} of Coke.', blanks: [{ index: 0, answer: 'glass' }] },
                    { speaker: 'B', text: 'Any {0} on your burger?', blanks: [{ index: 0, answer: 'sauce' }] },
                    { speaker: 'A', text: 'Yes, some ketchup and mustard, {0}.', blanks: [{ index: 0, answer: 'please' }] },
                    { speaker: 'B', text: 'Sure! That\'ll be $18.50. Enjoy your {0}!', blanks: [{ index: 0, answer: 'meal' }] }
                ]
            }
        ],
        reading: {
            title: '美国的城市交通',
            passage: 'Getting around American cities often requires a car, as public transportation is limited compared to Europe or Asia. However, cities like New York, Chicago, and Washington D.C. have well-developed subway and bus systems. The New York City Subway is the largest rapid transit system in the United States, with 472 stations. In many other cities, people rely heavily on driving. Ride-sharing services like Uber and Lyft have become extremely popular in recent years, offering an alternative to traditional taxis. For longer distances, domestic flights are common — the United States has over 19,000 airports. The famous yellow school buses are also a unique sight, safely transporting millions of students to school every day.',
            translation: '在美国城市出行通常需要开车，因为与欧洲或亚洲相比，公共交通有限。然而，像纽约、芝加哥和华盛顿特区这样的城市拥有发达完善的地铁和公交系统。纽约市地铁是美国最大的快速交通系统，拥有472个车站。在许多其他城市，人们严重依赖开车。近年来，Uber和Lyft等网约车服务变得极受欢迎，提供了传统出租车的替代方案。对于较长距离，国内航班很常见——美国拥有超过19,000个机场。著名的黄色校车也是一道独特的风景线，每天安全地将数百万学生送到学校。',
            vocabulary: [
                { word: 'rapid transit', meaning: 'n. 快速交通' },
                { word: 'rely on', meaning: 'v. 依赖' },
                { word: 'alternative', meaning: 'n. 替代方案' },
                { word: 'domestic flight', meaning: 'n. 国内航班' },
                { word: 'unique', meaning: 'adj. 独特的' }
            ],
            questions: [
                { question: 'Which city has the largest rapid transit system in the US?', options: ['A. Los Angeles', 'B. Chicago', 'C. New York City', 'D. Washington D.C.'], answer: 2, explanation: 'Mentioned: "The New York City Subway is the largest rapid transit system in the United States."' },
                { question: 'What is a popular alternative to traditional taxis in the US?', options: ['A. Yellow school buses', 'B. Uber and Lyft', 'C. Double-decker buses', 'D. The Tube'], answer: 1, explanation: 'Mentioned: "Ride-sharing services like Uber and Lyft have become extremely popular."' },
                { question: 'How many airports does the United States have?', options: ['A. Over 9,000', 'B. Over 14,000', 'C. Over 19,000', 'D. Over 24,000'], answer: 2, explanation: 'Mentioned: "the United States has over 19,000 airports."' }
            ]
        }
    },
    australia: {
        dialogues: [
            {
                id: 'ask_direction_aus',
                title: '问路场景',
                scene: '在悉尼市中心，你想去悉尼歌剧院，向当地人询问路线',
                lines: [
                    { speaker: 'A', text: 'G\'day! Could you tell me the way to the {0}?', blanks: [{ index: 0, answer: 'Opera House' }] },
                    { speaker: 'B', text: 'No worries! It\'s just a short {0} from here.', blanks: [{ index: 0, answer: 'walk' }] },
                    { speaker: 'A', text: 'Should I walk along the {0}?', blanks: [{ index: 0, answer: 'harbour' }] },
                    { speaker: 'B', text: 'Yeah, the view is {0} — you\'ll see the Bridge too.', blanks: [{ index: 0, answer: 'amazing' }] },
                    { speaker: 'A', text: 'Brilliant! Is there an {0} I can take if I get tired?', blanks: [{ index: 0, answer: 'uber' }] },
                    { speaker: 'B', text: 'Sure, but it\'s such a nice day — you should {0} walk!', blanks: [{ index: 0, answer: 'probably' }] }
                ]
            },
            {
                id: 'order_food_aus',
                title: '点餐场景',
                scene: '在悉尼一家咖啡馆，你正在点澳洲特色的早午餐',
                lines: [
                    { speaker: 'A', text: 'What\'s {0} in Australia?', blanks: [{ index: 0, answer: 'typical' }] },
                    { speaker: 'B', text: 'You have to try our {0} — avocado on toast with poached eggs.', blanks: [{ index: 0, answer: 'brunch' }] },
                    { speaker: 'A', text: 'That sounds {0}! I\'ll have that.', blanks: [{ index: 0, answer: 'delicious' }] },
                    { speaker: 'B', text: 'Great choice! Would you like a {0} coffee with that?', blanks: [{ index: 0, answer: 'flat white' }] },
                    { speaker: 'A', text: 'Yes, please. Australians take their {0} very seriously!', blanks: [{ index: 0, answer: 'coffee' }] },
                    { speaker: 'B', text: 'Too right we {0}! Enjoy!', blanks: [{ index: 0, answer: 'do' }] }
                ]
            }
        ],
        reading: {
            title: '澳大利亚的城市交通',
            passage: 'Australia\'s major cities — Sydney, Melbourne, Brisbane, and Perth — each have their own public transportation networks. Sydney has a comprehensive system including trains, buses, ferries, and light rail. The Sydney Ferries are particularly popular, offering spectacular views of the Opera House and Harbour Bridge as you cross the harbour. Melbourne is famous for its free tram zone in the city centre, making it easy and affordable for tourists to get around. In Brisbane, the CityCat ferry service is a favourite among both locals and visitors, providing a scenic route along the Brisbane River. Australia also has a long-distance coach network called Greyhound, connecting cities across the continent.',
            translation: '澳大利亚的主要城市——悉尼、墨尔本、布里斯班和珀斯——各自拥有自己的公共交通网络。悉尼拥有包括火车、公交车、轮渡和轻轨在内的完善系统。悉尼轮渡尤其受欢迎，在横渡海港时提供歌剧院和海港大桥的壮观景色。墨尔本以其市中心的免费电车区而闻名，让游客能轻松且实惠地出行。在布里斯班，CityCat轮渡服务是当地人和游客的最爱，沿着布里斯班河提供了一条观光路线。澳大利亚还拥有名为Greyhound的长途客车网络，连接着整个大陆上的各座城市。',
            vocabulary: [
                { word: 'comprehensive', meaning: 'adj. 全面的' },
                { word: 'ferry', meaning: 'n. 轮渡' },
                { word: 'spectacular', meaning: 'adj. 壮观的' },
                { word: 'affordable', meaning: 'adj. 实惠的' },
                { word: 'continent', meaning: 'n. 大陆' }
            ],
            questions: [
                { question: 'What is particularly popular in Sydney for transportation?', options: ['A. Light rail', 'B. Sydney Ferries', 'C. Free trams', 'D. Greyhound coaches'], answer: 1, explanation: 'Mentioned: "The Sydney Ferries are particularly popular."' },
                { question: 'Which Australian city has a free tram zone in the city centre?', options: ['A. Sydney', 'B. Brisbane', 'C. Perth', 'D. Melbourne'], answer: 3, explanation: 'Mentioned: "Melbourne is famous for its free tram zone in the city centre."' },
                { question: 'What is the name of Australia\'s long-distance coach network?', options: ['A. CityCat', 'B. Greyhound', 'C. Transperth', 'D. Myki'], answer: 1, explanation: 'Mentioned: "Australia also has a long-distance coach network called Greyhound."' }
            ]
        }
    },
    canada: {
        dialogues: [
            {
                id: 'ask_direction_ca',
                title: '问路场景',
                scene: '在多伦多市中心，你想去CN塔，向当地人询问路线',
                lines: [
                    { speaker: 'A', text: 'Excuse me, does this {0} go to the CN Tower?', blanks: [{ index: 0, answer: 'streetcar' }] },
                    { speaker: 'B', text: 'Yes, but it\'s actually within {0} distance from here.', blanks: [{ index: 0, answer: 'walking' }] },
                    { speaker: 'A', text: 'Really? How {0} is the walk?', blanks: [{ index: 0, answer: 'long' }] },
                    { speaker: 'B', text: 'About 15 minutes. Just head {0} on Front Street.', blanks: [{ index: 0, answer: 'west' }] },
                    { speaker: 'A', text: 'Thanks! Is there anything {0} to see along the way?', blanks: [{ index: 0, answer: 'else' }] },
                    { speaker: 'B', text: 'You\'ll pass the Rogers Centre — it\'s a famous {0} stadium.', blanks: [{ index: 0, answer: 'sports' }] }
                ]
            },
            {
                id: 'order_food_ca',
                title: '点餐场景',
                scene: '在多伦多一家餐厅，你正在点加拿大特色美食',
                lines: [
                    { speaker: 'A', text: 'What\'s a {0} Canadian dish?', blanks: [{ index: 0, answer: 'traditional' }] },
                    { speaker: 'B', text: 'You should try poutine — it\'s fries with {0} and gravy.', blanks: [{ index: 0, answer: 'cheese' }] },
                    { speaker: 'A', text: 'That sounds very {0}! I\'ll try it.', blanks: [{ index: 0, answer: 'interesting' }] },
                    { speaker: 'B', text: 'Would you also like to try some {0} syrup on your pancakes?', blanks: [{ index: 0, answer: 'maple' }] },
                    { speaker: 'A', text: 'Yes, please! I\'ve heard Canadian maple syrup is the {0} in the world.', blanks: [{ index: 0, answer: 'best' }] },
                    { speaker: 'B', text: 'It {0} is! Enjoy your meal!', blanks: [{ index: 0, answer: 'certainly' }] }
                ]
            }
        ],
        reading: {
            title: '加拿大的城市交通',
            passage: 'Canada\'s vast size makes transportation an interesting topic. In Toronto, the TTC (Toronto Transit Commission) operates buses, streetcars, and the subway, carrying over 1.5 million passengers daily. Toronto\'s streetcars are a charming feature of the city, running along major streets and offering great views. Vancouver\'s SkyTrain is a fully automated, driverless rapid transit system that connects the city centre with the suburbs. It is known for its reliability and stunning mountain views. In Montreal, the Metro system is famous for its unique station designs by renowned architects. For cross-country travel, VIA Rail offers scenic train journeys, including "The Canadian" — a multi-day trip from Toronto to Vancouver that passes through some of the country\'s most beautiful landscapes.',
            translation: '加拿大广阔的面积使得交通成为一个有趣的话题。在多伦多，TTC（多伦多交通委员会）运营公交车、有轨电车和地铁，每天运载超过150万乘客。多伦多的有轨电车是这座城市迷人的特色，沿主要街道行驶并提供绝佳景色。温哥华的SkyTrain是一个完全自动化的无人驾驶快速交通系统，连接市中心和郊区。它以可靠性和令人惊叹的山景而闻名。在蒙特利尔，地铁系统以知名建筑师设计的独特车站而闻名。对于跨国旅行，VIA Rail提供观光火车旅程，包括"加拿大人号"——一趟从多伦多到温哥华的多日旅行，途经该国一些最美丽的风景。',
            vocabulary: [
                { word: 'vast', meaning: 'adj. 广阔的' },
                { word: 'streetcar', meaning: 'n. 有轨电车' },
                { word: 'automated', meaning: 'adj. 自动化的' },
                { word: 'reliability', meaning: 'n. 可靠性' },
                { word: 'scenic', meaning: 'adj. 观光的' }
            ],
            questions: [
                { question: 'How many passengers does the TTC carry daily?', options: ['A. Over 500,000', 'B. Over 1 million', 'C. Over 1.5 million', 'D. Over 2 million'], answer: 2, explanation: 'Mentioned: "carrying over 1.5 million passengers daily."' },
                { question: 'What is special about Vancouver\'s SkyTrain?', options: ['A. It is the oldest subway', 'B. It is fully automated', 'C. It runs on coal', 'D. It has no windows'], answer: 1, explanation: 'Mentioned: "Vancouver\'s SkyTrain is a fully automated, driverless rapid transit system."' },
                { question: 'What is "The Canadian" train journey known for?', options: ['A. Fastest train in the world', 'B. Passing through beautiful landscapes', 'C. Connecting only Ontario', 'D. Being the cheapest option'], answer: 1, explanation: 'Mentioned: "passes through some of the country\'s most beautiful landscapes."' }
            ]
        }
    },
    ireland: {
        dialogues: [
            {
                id: 'ask_direction_ie',
                title: '问路场景',
                scene: '在都柏林，你想去圣三一学院，向路人询问路线',
                lines: [
                    { speaker: 'A', text: 'Hi! I\'m trying to find {0} College Dublin.', blanks: [{ index: 0, answer: 'Trinity' }] },
                    { speaker: 'B', text: 'Ah, you\'re very close! Just walk down this {0} and turn left.', blanks: [{ index: 0, answer: 'street' }] },
                    { speaker: 'A', text: 'Will I see the {0} on the way?', blanks: [{ index: 0, answer: 'castle' }] },
                    { speaker: 'B', text: 'You will! Dublin Castle is just {0} minutes away.', blanks: [{ index: 0, answer: 'five' }] },
                    { speaker: 'A', text: 'Perfect! Is the Book of Kells exhibition {0}?', blanks: [{ index: 0, answer: 'open' }] },
                    { speaker: 'B', text: 'Yes, until 5 p.m. You\'re going to {0} it!', blanks: [{ index: 0, answer: 'love' }] }
                ]
            },
            {
                id: 'order_food_ie',
                title: '点餐场景',
                scene: '在都柏林一家传统爱尔兰酒吧，你正在点餐',
                lines: [
                    { speaker: 'A', text: 'What do you {0} I order?', blanks: [{ index: 0, answer: 'recommend' }] },
                    { speaker: 'B', text: 'Try the Irish {0} stew — it\'s delicious and very filling.', blanks: [{ index: 0, answer: 'lamb' }] },
                    { speaker: 'A', text: 'Sounds good! And what about {0}?', blanks: [{ index: 0, answer: 'dessert' }] },
                    { speaker: 'B', text: 'You must try the apple {0} — it\'s a local favourite.', blanks: [{ index: 0, answer: 'crumble' }] },
                    { speaker: 'A', text: 'Great! And a pint of {0}, please.', blanks: [{ index: 0, answer: 'Guinness' }] },
                    { speaker: 'B', text: 'Excellent choice! Sláinte! (That\'s {0} for "cheers"!)', blanks: [{ index: 0, answer: 'Irish' }] }
                ]
            }
        ],
        reading: {
            title: '爱尔兰的交通系统',
            passage: 'Ireland is a relatively small country, making it easy to get around. In Dublin, the capital, the Luas (tram) system has two main lines that connect the city centre with the suburbs. The DART (Dublin Area Rapid Transit) is an electric railway along the beautiful coastline, running from Malahide in the north to Greystones in the south. For visiting the Cliffs of Moher, many tourists choose to join a guided bus tour from Galway, which takes about 1.5 hours each way. Driving in Ireland is a popular option, as it allows you to explore the stunning countryside at your own pace. However, visitors from outside Europe should note that Ireland drives on the left side of the road, the same as the UK.',
            translation: '爱尔兰是一个相对较小的国家，出行十分便利。在首都都柏林，Luas（有轨电车）系统有两条主要线路连接市中心和郊区。DART（都柏林区域快速交通）是一条沿美丽海岸线运行的电气化铁路，从北部的马拉海德到南部的格雷斯通斯。去莫赫悬崖，许多游客选择参加从戈尔韦出发的巴士导游团，单程约1.5小时。在爱尔兰开车是一个受欢迎的选择，因为它让你能按照自己的节奏探索令人惊叹的乡村。然而，来自欧洲以外的游客应该注意，爱尔兰和英国一样，车辆靠左行驶。',
            vocabulary: [
                { word: 'relatively', meaning: 'adv. 相对地' },
                { word: 'suburb', meaning: 'n. 郊区' },
                { word: 'coastline', meaning: 'n. 海岸线' },
                { word: 'at your own pace', meaning: '按照自己的节奏' },
                { word: 'vehicle', meaning: 'n. 车辆' }
            ],
            questions: [
                { question: 'What does the DART railway run along?', options: ['A. The River Liffey', 'B. The beautiful coastline', 'C. The motorway', 'D. The mountain range'], answer: 1, explanation: 'Mentioned: "DART... is an electric railway along the beautiful coastline."' },
                { question: 'How long does it take to get to the Cliffs of Moher from Galway by bus?', options: ['A. About 30 minutes', 'B. About 1 hour', 'C. About 1.5 hours', 'D. About 2.5 hours'], answer: 2, explanation: 'Mentioned: "which takes about 1.5 hours each way."' },
                { question: 'On which side of the road does Ireland drive?', options: ['A. Right side', 'B. Left side', 'C. Both sides', 'D. It depends on the region'], answer: 1, explanation: 'Mentioned: "Ireland drives on the left side of the road, the same as the UK."' }
            ]
        }
    },
    newzealand: {
        dialogues: [
            {
                id: 'ask_direction_nz',
                title: '问路场景',
                scene: '在皇后镇，你想去蹦极跳跃点，向当地人询问路线',
                lines: [
                    { speaker: 'A', text: 'Kia ora! Where can I go {0} jumping around here?', blanks: [{ index: 0, answer: 'bungee' }] },
                    { speaker: 'B', text: 'You can go to the Kawarau Bridge — it\'s the original {0} jumping site!', blanks: [{ index: 0, answer: 'bungee' }] },
                    { speaker: 'A', text: 'That\'s so {0}! How do I get there?', blanks: [{ index: 0, answer: 'cool' }] },
                    { speaker: 'B', text: 'You can drive, or take a {0} from the town centre.', blanks: [{ index: 0, answer: 'shuttle' }] },
                    { speaker: 'A', text: 'Is it {0} the whole year round?', blanks: [{ index: 0, answer: 'open' }] },
                    { speaker: 'B', text: 'Yes! But winter is especially {0} with the snowy mountains.', blanks: [{ index: 0, answer: 'beautiful' }] }
                ]
            },
            {
                id: 'order_food_nz',
                title: '点餐场景',
                scene: '在皇后镇一家咖啡馆，你正在点新西兰特色美食',
                lines: [
                    { speaker: 'A', text: 'What\'s {0} in New Zealand?', blanks: [{ index: 0, answer: 'typical' }] },
                    { speaker: 'B', text: 'You have to try our hokey pokey {0} — it\'s a local favourite!', blanks: [{ index: 0, answer: 'ice cream' }] },
                    { speaker: 'A', text: 'What\'s in {0}?', blanks: [{ index: 0, answer: 'it' }] },
                    { speaker: 'B', text: 'Vanilla ice cream with crunchy {0} toffee — absolutely delicious!', blanks: [{ index: 0, answer: 'honey' }] },
                    { speaker: 'A', text: 'I\'ll have a {0}, please!', blanks: [{ index: 0, answer: 'cone' }] },
                    { speaker: 'B', text: 'Great choice! Enjoy the {0} and the view!', blanks: [{ index: 0, answer: 'flavour' }] }
                ]
            }
        ],
        reading: {
            title: '新西兰的交通系统',
            passage: 'New Zealand consists of two main islands — the North Island and the South Island — and getting around requires some planning. In cities like Auckland and Wellington, buses are the main form of public transportation. However, many visitors choose to rent a car or a campervan, as this gives them the freedom to explore at their own pace. The scenery along the way is breathtaking, from rolling green hills to dramatic coastlines. To travel between the North and South Islands, tourists take the Interislander ferry, a 3.5-hour journey across the Cook Strait that offers spectacular views. For the more adventurous, hitchhiking is legal in New Zealand and considered relatively safe, though it is always important to exercise caution.',
            translation: '新西兰由两大主要岛屿组成——北岛和南岛——出行需要一些规划。在奥克兰和惠灵顿等城市，公交车是公共交通的主要形式。然而，许多游客选择租一辆车或房车，因为这让他们能按照自己的节奏自由探索。沿途的景色令人叹为观止，从起伏的绿色山丘到壮观的海岸线。要在北岛和南岛之间旅行，游客乘坐Interislander渡轮，这是一趟穿越库克海峡的3.5小时旅程，提供壮观的景色。对于更爱冒险的人来说，在新西兰搭便车是合法的，被认为相对安全，尽管保持谨慎始终是重要的。',
            vocabulary: [
                { word: 'campervan', meaning: 'n. 房车' },
                { word: 'dramatic', meaning: 'adj. 壮观的' },
                { word: 'ferry', meaning: 'n. 渡轮' },
                { word: 'adventurous', meaning: 'adj. 爱冒险的' },
                { word: 'hitchhike', meaning: 'v. 搭便车' }
            ],
            questions: [
                { question: 'What is the main form of public transportation in Auckland and Wellington?', options: ['A. Trains', 'B. Buses', 'C. Ferries', 'D. Trams'], answer: 1, explanation: 'Mentioned: "In cities like Auckland and Wellington, buses are the main form of public transportation."' },
                { question: 'How long does the Interislander ferry journey take?', options: ['A. 1.5 hours', 'B. 2.5 hours', 'C. 3.5 hours', 'D. 4.5 hours'], answer: 2, explanation: 'Mentioned: "a 3.5-hour journey across the Cook Strait."' },
                { question: 'What is said about hitchhiking in New Zealand?', options: ['A. It is illegal', 'B. It is legal and relatively safe', 'C. It is very dangerous', 'D. It is only for locals'], answer: 1, explanation: 'Mentioned: "hitchhiking is legal in New Zealand and considered relatively safe."' }
            ]
        }
    }
};
