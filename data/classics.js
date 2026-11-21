// 주역 64괘 괘사(卦辭) 및 대상전(大象傳) 원문·음독·풀이·구절 핵심 한자
(function (global) {
  'use strict';

  const HEXAGRAM_CLASSICS = {
    1: {
      guaOriginal: '乾 元亨利貞',
      guaReading: '건 원형이정',
      guaMeaning: '크게 열리고 막힘없이 통하며, 모두에게 이롭고 바른 원칙을 끝까지 지킵니다.',
      daXiangOriginal: '天行健 君子以自彊不息',
      daXiangReading: '천행건 군자이자강불식',
      daXiangMeaning: '하늘의 운행이 쉼 없이 굳세니, 군자는 이를 본받아 스스로 힘쓰고 쉬지 않습니다.',
      classicHanja: ['健', '自', '彊', '息']
    },
    2: {
      guaOriginal: '坤 元亨 利牝馬之貞 君子有攸往 先迷後得主 利',
      guaReading: '곤 원형 이빈마지정 군자유유왕 선미후득주 이',
      guaMeaning: '크게 통하되 암말처럼 유순하고 끈기 있게 바름을 지켜야 이롭습니다. 앞서 나가면 헤매고 뒤따를 때 중심을 얻습니다.',
      daXiangOriginal: '地勢坤 君子以厚德載物',
      daXiangReading: '지세곤 군자이후덕재물',
      daXiangMeaning: '땅의 형세가 넓고 두터우니, 군자는 이를 본받아 두터운 덕으로 만물을 포용하고 실어 나릅니다.',
      classicHanja: ['厚', '載', '物', '安']
    },
    3: {
      guaOriginal: '屯 元亨利貞 勿用有攸往 利建侯',
      guaReading: '준 원형이정 물용유유왕 이건후',
      guaMeaning: '크게 열리고 바름을 지킴이 이로우나 섣불리 멀리 움직이지 말고 도울 이를 세워 기반을 다져야 합니다.',
      daXiangOriginal: '雲雷 屯 君子以經綸',
      daXiangReading: '운뢰 준 군자이경륜',
      daXiangMeaning: '구름과 우레가 어우러져 비가 오려는 때이니, 군자는 얽힌 실타래를 풀듯 질서와 계획을 세워 다스립니다.',
      classicHanja: ['雲', '建', '經', '綸']
    },
    4: {
      guaOriginal: '蒙 亨 匪我求童蒙 童蒙求我 初筮告 再三瀆 瀆則不告 利貞',
      guaReading: '몽 형 비아구동몽 동몽구아 초서고 재삼독 독칙불고 이정',
      guaMeaning: '배우는 이가 정성껏 물을 때 비로소 길이 열립니다. 가벼운 마음으로 되풀이해 묻기보다 바르게 깨치는 데 힘써야 합니다.',
      daXiangOriginal: '山下出泉 蒙 君子以果行育德',
      daXiangReading: '산하출천 몽 군자이과행육덕',
      daXiangMeaning: '산 아래에서 맑은 샘물이 솟아 흐르듯, 군자는 과감히 옳은 일을 실행하고 덕을 길러 나갑니다.',
      classicHanja: ['泉', '果', '行', '育']
    },
    5: {
      guaOriginal: '需 有孚 光亨 貞吉 利涉大川',
      guaReading: '수 유부 광형 정길 이섭대천',
      guaMeaning: '진실한 믿음이 있으면 밝게 형통하고 바르게 길하여, 큰 내를 건너는 어려운 일도 이롭습니다.',
      daXiangOriginal: '雲上於天 需 君子以飲食宴樂',
      daXiangReading: '운상어천 수 군자이음식연락',
      daXiangMeaning: '구름이 하늘 위로 올라 비가 내리기를 기다리듯, 군자는 먹고 마시며 마음을 편안히 해 때를 기다립니다.',
      classicHanja: ['光', '涉', '川', '宴']
    },
    6: {
      guaOriginal: '訟 有孚 窒惕 中吉 終凶 利見大人 不利涉大川',
      guaReading: '송 유부 질척 중길 종흉 이견대인 불이섭대천',
      guaMeaning: '진실이 있어도 막혀 두려움이 따르니 중간에 멈추면 길하고 끝까지 다투면 흉합니다.',
      daXiangOriginal: '天與水違行 訟 君子以作事謀始',
      daXiangReading: '천여수위행 송 군자이작사모시',
      daXiangMeaning: '하늘은 위로, 물은 아래로 어긋나 흐르니, 군자는 일을 시작할 때부터 분쟁의 소지가 없도록 치밀하게 도모합니다.',
      classicHanja: ['違', '作', '謀', '惕']
    },
    7: {
      guaOriginal: '師 貞 丈人 吉 无咎',
      guaReading: '사 정 장인 길 무구',
      guaMeaning: '바른 명분과 노련하고 덕망 있는 지도력이 서면 길하고 허물이 없습니다.',
      daXiangOriginal: '地中有水 師 君子以容民畜衆',
      daXiangReading: '지중유수 사 군자이용민축중',
      daXiangMeaning: '땅속에 큰 물이 머금어져 있듯, 군자는 너그러이 사람을 품고 여럿을 길러 하나로 모읍니다.',
      classicHanja: ['丈', '容', '民', '衆']
    },
    8: {
      guaOriginal: '比 吉 原筮 元永貞 无咎 不寧方來 後夫凶',
      guaReading: '비 길 원서 원영정 무구 불녕방래 후부흉',
      guaMeaning: '서로 친하고 도우면 길하니, 처음의 중심과 영원한 바름을 살펴 늦지 않게 합류해야 합니다.',
      daXiangOriginal: '地上有水 比 先王以建萬國 親諸侯',
      daXiangReading: '지상유수 비 선왕이건만국 친제후',
      daXiangMeaning: '땅 위에 물이 고루 스며 친밀하듯, 선왕은 질서를 세워 주변과 화목하게 친교를 맺습니다.',
      classicHanja: ['永', '萬', '親', '寧']
    },
    9: {
      guaOriginal: '小畜 亨 密雲不雨 自我西郊',
      guaReading: '소축 형 밀운불우 자아서교',
      guaMeaning: '형통하나 짙은 구름만 끼고 아직 비가 내리지 않으니, 작은 힘과 준비를 차근차근 모아야 합니다.',
      daXiangOriginal: '風行天上 小畜 君子以懿文德',
      daXiangReading: '풍행천상 소축 군자이의문덕',
      daXiangMeaning: '바람이 하늘 위를 불어 만물을 어루만지듯, 군자는 내면의 아름다운 문채와 덕을 곱게 가꿉니다.',
      classicHanja: ['密', '雨', '懿', '文']
    },
    10: {
      guaOriginal: '履虎尾 不咥人 亨',
      guaReading: '리호미 불질인 형',
      guaMeaning: '호랑이의 꼬리를 밟고서도 사람을 물지 않으니, 예의와 신중함으로 나아가면 형통합니다.',
      daXiangOriginal: '上天下澤 履 君子以辨上下 定民志',
      daXiangReading: '상천하택 리 군자이변상하 정민지',
      daXiangMeaning: '위에는 하늘, 아래에는 연못이 제자리를 지키듯, 군자는 위아래 분수를 분별해 사람들의 뜻을 안정시킵니다.',
      classicHanja: ['虎', '尾', '辨', '志']
    },
    11: {
      guaOriginal: '泰 小往大來 吉亨',
      guaReading: '태 소왕대래 길형',
      guaMeaning: '작은 기운은 물러가고 크고 바른 기운이 다가오니 길하고 형통합니다.',
      daXiangOriginal: '天地交 泰 后以財成天地之道 輔相天地之宜 以左右民',
      daXiangReading: '천지교 태 후이재성천지지도 보상천지지의 이좌우민',
      daXiangMeaning: '하늘과 땅이 사귀어 통하니, 지도자는 자연의 이치를 마름질해 이루고 도우며 사람들을 보살핍니다.',
      classicHanja: ['往', '來', '交', '輔']
    },
    12: {
      guaOriginal: '否之匪人 不利君子貞 大往小來',
      guaReading: '비지비인 불이군자정 대왕소래',
      guaMeaning: '하늘과 땅이 통하지 않아 옳은 뜻을 펴기 어려우나 군자는 흔들리지 말아야 합니다.',
      daXiangOriginal: '天地不交 否 君子以儉德辟難 不可榮以祿',
      daXiangReading: '천지불교 비 군자이검덕피난 불가영이록',
      daXiangMeaning: '하늘과 땅이 사귀지 않아 막힌 때이니, 군자는 덕을 아껴 재난을 피하고 헛된 영화와 이익에 흔들리지 않습니다.',
      classicHanja: ['辟', '難', '榮', '祿']
    },
    13: {
      guaOriginal: '同人于野 亨 利涉大川 利君子貞',
      guaReading: '동인우야 형 이섭대천 이군자정',
      guaMeaning: '넓은 들에서 사심 없이 사람들과 뜻을 함께하면 형통하고 큰 난관도 건널 수 있습니다.',
      daXiangOriginal: '天與火 同人 君子以類族辨物',
      daXiangReading: '천여화 동인 군자이류족변물',
      daXiangMeaning: '하늘과 불이 서로 밝게 비추니, 군자는 사물의 갈래를 밝히고 각기 제 빛깔대로 어울리게 합니다.',
      classicHanja: ['野', '類', '族', '辨']
    },
    14: {
      guaOriginal: '大有 元亨',
      guaReading: '대유 원형',
      guaMeaning: '크게 소유하고 넉넉하니 근본에서부터 막힘없이 크게 형통합니다.',
      daXiangOriginal: '火在天上 大有 君子以遏惡揚善 順天休命',
      daXiangReading: '화재천상 대유 군자이알악양선 순천휴명',
      daXiangMeaning: '해가 하늘 높이 떠 온 세상을 비추니, 군자는 악한 것을 막고 선한 것을 드날려 하늘의 아름다운 명을 따릅니다.',
      classicHanja: ['遏', '惡', '揚', '善']
    },
    15: {
      guaOriginal: '謙 亨 君子有終',
      guaReading: '겸 형 군자유종',
      guaMeaning: '겸손하면 막힘없이 형통하니 군자는 아름다운 끝맺음을 이룹니다.',
      daXiangOriginal: '地中有山 謙 君子以裒多益寡 稱物平施',
      daXiangReading: '지중유산 겸 군자이부다익과 칭물평시',
      daXiangMeaning: '넓은 땅속에 높은 산이 낮추어 자리 잡았듯, 군자는 많은 곳에서 덜어 적은 곳에 보태어 균형을 맞추고 고르게 베풉니다.',
      classicHanja: ['裒', '寡', '稱', '平', '施']
    },
    16: {
      guaOriginal: '豫 利建侯行師',
      guaReading: '예 이건후행사',
      guaMeaning: '모두가 기뻐하며 호응하는 때이므로 뜻을 세우고 실행에 옮김이 이롭습니다.',
      daXiangOriginal: '雷出地奮 豫 先王以作樂崇德 殷薦之上帝 以配祖考',
      daXiangReading: '뢰출지분 예 선왕이작악숭덕 은천지상제 이배조고',
      daXiangMeaning: '우레가 땅에서 떨쳐 일어나 만물을 깨우니, 선왕은 음악으로 조화를 이루고 덕을 높여 정성을 다합니다.',
      classicHanja: ['奮', '崇', '薦', '配']
    },
    17: {
      guaOriginal: '隨 元亨利貞 无咎',
      guaReading: '수 원형이정 무구',
      guaMeaning: '때의 흐름을 바르게 따르면 크게 열리고 형통하며 허물이 없습니다.',
      daXiangOriginal: '澤中有雷 隨 君子以嚮晦入宴息',
      daXiangReading: '택중유뢰 수 군자이향회입연식',
      daXiangMeaning: '우레가 연못 속으로 들어가 고요히 쉬듯, 군자는 날이 저물면 안으로 들어와 편안히 휴식하며 내일을 기약합니다.',
      classicHanja: ['嚮', '晦', '入', '息']
    },
    18: {
      guaOriginal: '蠱 元亨 利涉大川 先甲三日 後甲三日',
      guaReading: '고 원형 이섭대천 선갑삼일 후갑삼일',
      guaMeaning: '묵은 폐단을 바로잡으면 크게 열리니, 시작 전 사흘과 이후 사흘을 깊이 살펴야 합니다.',
      daXiangOriginal: '山下有風 蠱 君子以振民育德',
      daXiangReading: '산하유풍 고 군자이진민육덕',
      daXiangMeaning: '산 아래에서 바람이 불어 정체된 기운을 깨우듯, 군자는 사람들을 떨쳐 일으키고 자신의 덕을 기릅니다.',
      classicHanja: ['甲', '振', '育', '先']
    },
    19: {
      guaOriginal: '臨 元亨利貞 至于八月有凶',
      guaReading: '림 원형이정 지우팔월유흉',
      guaMeaning: '크게 형통하고 바르나 성대한 뒤에는 쇠할 때가 옴을 미리 경계해야 합니다.',
      daXiangOriginal: '澤上有地 臨 君子以敎思无穷 容保民无疆',
      daXiangReading: '택상유지 림 군자이교사무궁 용보민무강',
      daXiangMeaning: '연못 위의 땅이 물을 감싸 돌보듯, 군자는 끝없는 마음으로 가르치고 한계 없는 너그러움으로 사람들을 보살핍니다.',
      classicHanja: ['敎', '思', '窮', '保']
    },
    20: {
      guaOriginal: '觀 盥而不薦 有孚顒若',
      guaReading: '관 관이불천 유부옹약',
      guaMeaning: '제사를 앞두고 손을 씻어 경건한 정성을 모은 상태처럼 진실한 믿음으로 모범을 보입니다.',
      daXiangOriginal: '風行地上 觀 先王以省方觀民設敎',
      daXiangReading: '풍행지상 관 선왕이성방관민설교',
      daXiangMeaning: '바람이 땅 위를 두루 훑고 지나가듯, 선왕은 사방을 두루 살피고 사람들의 형편을 보아 가르침을 세웁니다.',
      classicHanja: ['省', '方', '設', '敎']
    },
    21: {
      guaOriginal: '噬嗑 亨 利用獄',
      guaReading: '서합 형 이용옥',
      guaMeaning: '가로막힌 장애물을 씹어 끊어내면 형통하니 공정한 법과 원칙을 바로 세움이 이롭습니다.',
      daXiangOriginal: '雷電 噬嗑 先王以明罰勅法',
      daXiangReading: '뢰전 서합 선왕이명벌칙법',
      daXiangMeaning: '우레와 번개가 함께 치듯, 선왕은 상벌의 기준을 밝히고 법과 질서를 엄정히 바로잡습니다.',
      classicHanja: ['電', '罰', '勅', '法']
    },
    22: {
      guaOriginal: '賁 亨 小利有攸往',
      guaReading: '비 형 소리유유왕',
      guaMeaning: '질박한 바탕 위에 품격 있게 다듬으니 형통하며 작은 일과 표현을 가꾸는 데 이롭습니다.',
      daXiangOriginal: '山下有火 賁 君子以明庶政 无敢折獄',
      daXiangReading: '산하유화 비 군자이명서정 무감절옥',
      daXiangMeaning: '산 아래 타오르는 불빛이 사물을 환히 비추듯, 군자는 일상의 행정은 밝히되 큰 판결은 겉모습만 보고 함부로 내리지 않습니다.',
      classicHanja: ['庶', '政', '敢', '折']
    },
    23: {
      guaOriginal: '剝 不利有攸往',
      guaReading: '박 불이유유왕',
      guaMeaning: '겉의 힘이 깎여 내려가는 때이므로 무리하게 나아가려 하면 이롭지 않습니다.',
      daXiangOriginal: '山附於地 剝 上以厚下安宅',
      daXiangReading: '산부어지 박 상이후하안택',
      daXiangMeaning: '산이 땅 위에 기대어 서 있듯, 윗자리에 있을수록 아래 기반을 두텁게 돌보아야 거처가 편안합니다.',
      classicHanja: ['附', '下', '安', '宅']
    },
    24: {
      guaOriginal: '復 亨 出入无疾 朋來无咎 反復其道 七日來復 利有攸往',
      guaReading: '복 형 출입무질 붕래무구 반복기도 칠일래복 이유유왕',
      guaMeaning: '형통합니다. 오고 감에 탈이 없고 벗들이 찾아오며 바른 길이 일곱째 날에 되돌아오니 나아감이 이롭습니다.',
      daXiangOriginal: '雷在地中 復 先王以至日閉關 商旅不行 后不省方',
      daXiangReading: '뢰재지중 복 선왕이지일폐관 상려불행 후불성방',
      daXiangMeaning: '우레가 땅속에 막 돋아나듯, 선왕은 동짓날 관문을 닫고 바깥 이동을 멈추어 새 기운을 조용히 기릅니다.',
      classicHanja: ['朋', '閉', '關', '商']
    },
    25: {
      guaOriginal: '无妄 元亨利貞 其匪正有眚 不利有攸往',
      guaReading: '무망 원형이정 기비정유생 불이유유왕',
      guaMeaning: '거짓 없이 순수하면 크게 열리나, 바름에서 벗어나면 뜻밖의 허물이 따릅니다.',
      daXiangOriginal: '天下雷行 物與无妄 先王以茂對時育萬物',
      daXiangReading: '천하뢰행 물여무망 선왕이무대시육만물',
      daXiangMeaning: '하늘 아래 우레가 울려 만물이 저마다 진실하게 깨어나니, 선왕은 때에 힘써 맞추어 만물을 길러냅니다.',
      classicHanja: ['匪', '眚', '茂', '對']
    },
    26: {
      guaOriginal: '大畜 利貞 不家食吉 利涉大川',
      guaReading: '대축 이정 불가식길 이섭대천',
      guaMeaning: '큰 역량을 쌓아 바르게 지키며, 집안에만 머물지 않고 세상과 나누며 큰 일을 건너면 길합니다.',
      daXiangOriginal: '天在山中 大畜 君子以多識前言往行 以畜其德',
      daXiangReading: '천재산중 대축 군자이다식전언왕행 이축기덕',
      daXiangMeaning: '큰 산 안에 하늘의 기운을 품었듯, 군자는 옛 사람의 좋은 말씀과 행실을 많이 익혀 자신의 덕을 크게 쌓습니다.',
      classicHanja: ['多', '識', '言', '行']
    },
    27: {
      guaOriginal: '頤 貞吉 觀頤 自求口實',
      guaReading: '이 정길 관이 자구구실',
      guaMeaning: '바르게 기르면 길하니, 무엇을 기르고 어떤 말과 양식을 스스로 취하는지 살펴야 합니다.',
      daXiangOriginal: '山下有雷 頤 君子以愼言語 節飮食',
      daXiangReading: '산하유뢰 이 군자이신언어 절음식',
      daXiangMeaning: '산 아래에서 우레가 움직여 만물을 기르듯, 군자는 입에서 나가는 말을 삼가고 몸에 들어오는 음식을 절제합니다.',
      classicHanja: ['口', '實', '語', '食']
    },
    28: {
      guaOriginal: '大過 棟橈 利有攸往 亨',
      guaReading: '대과 동요 이유유왕 형',
      guaMeaning: '대들보가 휠 만큼 무거운 때이나 나아갈 바를 바로 잡으면 형통합니다.',
      daXiangOriginal: '澤滅木 大過 君子以獨立不懼 遯世无悶',
      daXiangReading: '택멸목 대과 군자이독립불구 둔세무민',
      daXiangMeaning: '연못 물이 나무를 덮을 만큼 거센 때에도, 군자는 홀로 서서 두려워하지 않고 세상이 알아주지 않아도 번민하지 않습니다.',
      classicHanja: ['棟', '獨', '立', '懼', '悶']
    },
    29: {
      guaOriginal: '習坎 有孚 維心亨 行有尙',
      guaReading: '습감 유부 유심형 행유상',
      guaMeaning: '험난함이 거듭되어도 진실한 믿음으로 마음을 굳게 지키면 형통하고 행함에 공이 있습니다.',
      daXiangOriginal: '水洊至 習坎 君子以常德行 習敎事',
      daXiangReading: '수천지 습감 군자이상덕행 습교사',
      daXiangMeaning: '물이 끊임없이 이어져 흐르듯, 군자는 일상에서 덕행을 한결같이 하고 가르치고 익히는 일을 거듭합니다.',
      classicHanja: ['心', '尙', '常', '習']
    },
    30: {
      guaOriginal: '離 利貞 亨 畜牝牛吉',
      guaReading: '리 이정 형 축빈우길',
      guaMeaning: '바름을 지킴이 이롭고 형통하며, 암소처럼 유순하고 성실한 덕을 기르면 길합니다.',
      daXiangOriginal: '明兩作 離 大人以繼明照于四方',
      daXiangReading: '명량작 리 대인이계명조우사방',
      daXiangMeaning: '밝음이 거듭 이어져 빛나듯, 큰 사람은 지혜의 밝음을 끊임없이 이어 사방을 환하게 비춥니다.',
      classicHanja: ['兩', '繼', '照', '四']
    },
    31: {
      guaOriginal: '咸 亨 利貞 取女吉',
      guaReading: '함 형 이정 취녀길',
      guaMeaning: '마음이 서로 감응하니 형통하고 바른 도리로 인연을 맺으면 길합니다.',
      daXiangOriginal: '山上有澤 咸 君子以虛受人',
      daXiangReading: '산상유택 함 군자이허수인',
      daXiangMeaning: '산 위에 연못이 있어 기운이 통하듯, 군자는 마음을 비워 편견 없이 사람을 받아들입니다.',
      classicHanja: ['虛', '受', '女', '人']
    },
    32: {
      guaOriginal: '恒 亨 无咎 利貞 利有攸往',
      guaReading: '항 형 무구 이정 이유유왕',
      guaMeaning: '한결같이 이어가면 형통하고 허물이 없으며, 바름을 지켜 나아가면 이롭습니다.',
      daXiangOriginal: '雷風 恒 君子以立不易方',
      daXiangReading: '뢰풍 항 군자이입불역방',
      daXiangMeaning: '우레와 바람이 늘 짝지어 운행하듯, 군자는 뜻을 세운 자리에서 쉽게 방향을 바꾸지 않습니다.',
      classicHanja: ['立', '不', '易', '方']
    },
    33: {
      guaOriginal: '遁 亨 小利貞',
      guaReading: '돈 형 소이정',
      guaMeaning: '물러설 때를 알아 조용히 자리를 비키면 형통하며 작은 일부터 바르게 지킴이 이롭습니다.',
      daXiangOriginal: '天下有山 遁 君子以遠小人 不惡而嚴',
      daXiangReading: '천하유산 돈 군자이원소인 불오이엄',
      daXiangMeaning: '하늘 아래 산이 우뚝 솟아 멀어지듯, 군자는 도리에 어긋난 흐름을 미워해 다투지 않고 스스로 엄정히 거리를 둡니다.',
      classicHanja: ['遠', '惡', '嚴', '小']
    },
    34: {
      guaOriginal: '大壯 利貞',
      guaReading: '대장 이정',
      guaMeaning: '기세가 크게 뻗어 오르는 때일수록 바른 도리와 절도를 지킴이 이롭습니다.',
      daXiangOriginal: '雷在天上 大壯 君子以非禮弗履',
      daXiangReading: '뢰재천상 대장 군자이비례불리',
      daXiangMeaning: '하늘 위에 우레가 울려 위엄이 크듯, 군자는 예의와 도리에 맞지 않는 길은 밟지 않습니다.',
      classicHanja: ['非', '禮', '弗', '履']
    },
    35: {
      guaOriginal: '晉 康侯用錫馬蕃庶 晝日三接',
      guaReading: '진 강후용석마번서 주일삼접',
      guaMeaning: '밝은 덕으로 나아가니 두터운 신뢰와 포상을 얻어 하루에도 세 번이나 반가이 맞이합니다.',
      daXiangOriginal: '明出地上 晉 君子以自昭明德',
      daXiangReading: '명출지상 진 군자이자소명덕',
      daXiangMeaning: '태양이 땅 위로 솟아오르듯, 군자는 스스로의 밝은 덕과 진심을 환하게 드러내어 닦습니다.',
      classicHanja: ['康', '晝', '昭', '德']
    },
    36: {
      guaOriginal: '明夷 利艱貞',
      guaReading: '명이 이간정',
      guaMeaning: '밝음이 가려진 때이므로 어려움 속에서도 흔들리지 않고 바름을 지킴이 이롭습니다.',
      daXiangOriginal: '明入地中 明夷 君子以莅衆 用晦而明',
      daXiangReading: '명입지중 명이 군자이리중 용회이명',
      daXiangMeaning: '태양이 땅 아래로 들어가 숨듯, 군자는 사람을 대할 때 겉의 총명을 감추고서도 속으로 밝음을 잃지 않습니다.',
      classicHanja: ['艱', '莅', '晦', '明']
    },
    37: {
      guaOriginal: '家人 利女貞',
      guaReading: '가인 이녀정',
      guaMeaning: '가정과 가까운 안쪽의 살림과 도리가 바르고 성실할 때 모든 일이 이롭습니다.',
      daXiangOriginal: '風自火出 家人 君子以言有物 而行有恒',
      daXiangReading: '풍자화출 가인 군자이언유물 이행유항',
      daXiangMeaning: '불기운에서 따뜻한 바람이 피어오르듯, 군자는 말에는 알찬 내용이 있고 행동에는 변함없는 한결같음이 있습니다.',
      classicHanja: ['言', '物', '行', '恒']
    },
    38: {
      guaOriginal: '睽 小事吉',
      guaReading: '규 소사길',
      guaMeaning: '서로 뜻이 어긋나는 때에는 큰 일을 한 번에 밀기보다 작고 구체적인 일부터 풀면 길합니다.',
      daXiangOriginal: '上火下澤 睽 君子以同而異',
      daXiangReading: '상화하택 규 군자이동이이',
      daXiangMeaning: '불은 위로 타고 연못은 아래로 모이듯, 군자는 큰 뜻은 함께하되 저마다의 다름과 개성을 인정합니다.',
      classicHanja: ['事', '同', '異', '吉']
    },
    39: {
      guaOriginal: '蹇 利西南 不利東北 利見大人 貞吉',
      guaReading: '건 이서남 불이동북 이견대인 정길',
      guaMeaning: '험한 길 앞에서는 무리한 돌파를 피하고 평탄한 협력과 현명한 조력을 구하며 바름을 지키면 길합니다.',
      daXiangOriginal: '山上有水 蹇 君子以反身修德',
      daXiangReading: '산상유수 건 군자이반신수덕',
      daXiangMeaning: '험한 산 위에 물이 고여 길 막힘을 만나듯, 군자는 밖을 탓하지 않고 스스로 몸을 돌이켜 덕을 닦습니다.',
      classicHanja: ['見', '反', '身', '修']
    },
    40: {
      guaOriginal: '解 利西南 无所往 其來復吉 有攸往 夙吉',
      guaReading: '해 이서남 무소왕 기래복길 유유왕 숙길',
      guaMeaning: '어려움이 풀리면 할 일이 없을 때는 빨리 본래 자리로 돌아옴이 길하고, 할 일이 있으면 서둘러 마무리지음이 길합니다.',
      daXiangOriginal: '雷雨作 解 君子以赦過宥罪',
      daXiangReading: '뢰우작 해 군자이사과유죄',
      daXiangMeaning: '우레와 비가 내려 얼어붙은 대지를 녹이듯, 군자는 남의 허물을 용서하고 잘못을 너그럽게 풀어줍니다.',
      classicHanja: ['夙', '赦', '過', '宥']
    },
    41: {
      guaOriginal: '損 有孚 元吉 无咎 可貞 利有攸往 曷之用 二簋可用享',
      guaReading: '손 유부 원길 무구 가정 이유유왕 갈지용 이궤가용향',
      guaMeaning: '진실한 믿음이 있으면 크게 길하고 허물이 없으며, 소박한 두 그릇의 정성만으로도 마음을 전할 수 있습니다.',
      daXiangOriginal: '山下有澤 損 君子以懲忿窒欲',
      daXiangReading: '산하유택 손 군자이징분질욕',
      daXiangMeaning: '산 아래 연못이 패여 산에 보태듯, 군자는 치밀어 오르는 분노를 경계하고 끝없는 욕심을 막아 덜어냅니다.',
      classicHanja: ['懲', '忿', '窒', '欲']
    },
    42: {
      guaOriginal: '益 利有攸往 利涉大川',
      guaReading: '익 이유유왕 이섭대천',
      guaMeaning: '서로 보태고 이롭게 하는 때이므로 목표를 향해 나아가고 큰 일을 건너기에도 이롭습니다.',
      daXiangOriginal: '風雷 益 君子以見善則遷 有過則改',
      daXiangReading: '풍뢰 익 군자이견선즉천 유과즉개',
      daXiangMeaning: '바람과 우레가 서로 기세를 돕듯, 군자는 좋은 점을 보면 즉시 옮겨 따르고 잘못을 알면 바로 고칩니다.',
      classicHanja: ['善', '遷', '過', '改']
    },
    43: {
      guaOriginal: '夬 揚于王庭 孚號 有厲 告自邑 不利卽戎 利有攸往',
      guaReading: '쾌 양우왕정 부호 유려 고자읍 불이즉융 이유유왕',
      guaMeaning: '공개적으로 당당히 알리고 진심으로 호소하되 위태로움을 경계하며, 무력보다 명분으로 결단해야 이롭습니다.',
      daXiangOriginal: '澤上於天 夬 君子以施祿及下 居德則忌',
      daXiangReading: '택상어천 쾌 군자이시록급하 거덕즉기',
      daXiangMeaning: '연못의 물이 하늘 위로 차올라 쏟아지듯, 군자는 혜택과 성과를 아래에 고루 나누고 공을 독점해 쌓아두기를 꺼립니다.',
      classicHanja: ['號', '告', '施', '居']
    },
    44: {
      guaOriginal: '姤 女壯 勿用取女',
      guaReading: '구 여장 물용취녀',
      guaMeaning: '우연히 마주친 작은 기운이 빠르게 자라니 가벼이 끌려 깊은 인연을 맺지 말고 신중히 살핍니다.',
      daXiangOriginal: '天下有風 姤 后以施命誥四方',
      daXiangReading: '천하유풍 구 후이시명고사방',
      daXiangMeaning: '하늘 아래 바람이 불어 만물과 두루 만나듯, 지도자는 바른 뜻과 명령을 사방에 널리 알립니다.',
      classicHanja: ['命', '誥', '四', '方']
    },
    45: {
      guaOriginal: '萃 亨 王假有廟 利見大人 亨 利貞 用大牲吉 利有攸往',
      guaReading: '취 형 왕격유묘 이견대인 형 이정 용대생길 이유유왕',
      guaMeaning: '사람과 뜻이 한곳에 모여 형통하니, 정성을 다해 큰 중심을 세우고 바르게 나아감이 길합니다.',
      daXiangOriginal: '澤上於地 萃 君子以除戎器 戒不虞',
      daXiangReading: '택상어지 취 군자이제융기 계불우',
      daXiangMeaning: '땅 위에 연못 물이 넉넉히 모여들듯, 군자는 사람이 모일수록 수단을 정비해 뜻밖의 변고에 미리 대비합니다.',
      classicHanja: ['除', '戒', '虞', '聚']
    },
    46: {
      guaOriginal: '升 元亨 用見大人 勿恤 南征吉',
      guaReading: '승 원형 용견대인 물휼 남정길',
      guaMeaning: '크게 형통하니 믿을 만한 조력자를 만나 근심 없이 밝은 앞길로 나아가면 길합니다.',
      daXiangOriginal: '地中生木 升 君子以順德 積小以高大',
      daXiangReading: '지중생목 승 군자이순덕 적소이고대',
      daXiangMeaning: '땅속에서 나무가 싹터 자라 오르듯, 군자는 유순한 덕으로 작은 실천을 차곡차곡 쌓아 높고 크게 이룹니다.',
      classicHanja: ['生', '順', '積', '高']
    },
    47: {
      guaOriginal: '困 亨 貞 大人吉 无咎 有言不信',
      guaReading: '곤 형 정 대인길 무구 유언불신',
      guaMeaning: '궁핍하고 막혔어도 중심을 지키는 큰 사람에게는 길하고 허물이 없으나, 말로만 해서는 믿어주지 않는 때입니다.',
      daXiangOriginal: '澤无水 困 君子以致命遂志',
      daXiangReading: '택무수 곤 군자이치명수지',
      daXiangMeaning: '연못 아래로 물이 빠져나가 메마른 때이니, 군자는 목숨을 걸고서라도 스스로 세운 뜻을 끝까지 이룹니다.',
      classicHanja: ['信', '致', '遂', '志']
    },
    48: {
      guaOriginal: '井 改邑不改井 无喪无得 往來井井 汔至 亦未繘井 羸其甁 凶',
      guaReading: '정 개읍불개정 무상무득 왕래정정 흘지 역미율정 이기병 흉',
      guaMeaning: '마을은 옮겨도 우물은 옮기지 않듯 본질은 줄거나 늘지 않고 오가는 이들에게 변함없이 물을 주나, 거의 다 길어 올리고도 두레박줄이 미치지 못하거나 두레박을 깨뜨리면 흉합니다.',
      daXiangOriginal: '木上有水 井 君子以勞民勸相',
      daXiangReading: '목상유수 정 군자이로민권상',
      daXiangMeaning: '나무 위로 맑은 물이 길어 올려지듯, 군자는 수고하는 이들을 위로하고 서로 힘내어 돕도록 권장합니다.',
      classicHanja: ['改', '勞', '勸', '相']
    },
    49: {
      guaOriginal: '革 已日乃孚 元亨利貞 悔亡',
      guaReading: '혁 이일내부 원형이정 회망',
      guaMeaning: '때가 무르익은 날에 변혁하면 사람들이 믿고 따르니 크게 열리고 후회가 사라집니다.',
      daXiangOriginal: '澤中有火 革 君子以治歷明時',
      daXiangReading: '택중유화 혁 군자이치력명시',
      daXiangMeaning: '연못 속의 물과 불이 만나 서로 변화하듯, 군자는 책력을 다스려 계절과 때의 변화를 분명히 밝힙니다.',
      classicHanja: ['歷', '治', '時', '悔']
    },
    50: {
      guaOriginal: '鼎 元吉 亨',
      guaReading: '정 원길 형',
      guaMeaning: '새로운 질서와 그릇이 묵직하게 자리 잡으니 크게 길하고 형통합니다.',
      daXiangOriginal: '木上有火 鼎 君子以正位凝命',
      daXiangReading: '목상유화 정 군자이정위응명',
      daXiangMeaning: '나무 위에 불이 지펴져 솥을 데우듯, 군자는 제자리를 바르게 세우고 흩어진 뜻을 하나로 모아 굳건히 합니다.',
      classicHanja: ['位', '凝', '命', '正']
    },
    51: {
      guaOriginal: '震 亨 震來虩虩 笑言啞啞 震驚百里 不喪匕鬯',
      guaReading: '진 형 진래혁혁 소언액액 진경백리 불상비창',
      guaMeaning: '천둥이 쳐서 놀라더라도 조심하며 중심을 잃지 않으면 곧 웃으며 말하게 되고 맡은 본분을 놓치지 않습니다.',
      daXiangOriginal: '洊雷 震 君子以恐懼修省',
      daXiangReading: '천뢰 진 군자이공구수성',
      daXiangMeaning: '우레가 거듭 울려 퍼지니, 군자는 두려운 경계심을 품고 스스로의 허물을 닦아 살핍니다.',
      classicHanja: ['驚', '恐', '懼', '修', '省']
    },
    52: {
      guaOriginal: '艮其背 不獲其身 行其庭 不見其人 无咎',
      guaReading: '간기배 불획기신 행기정 불견기인 무구',
      guaMeaning: '욕심이 없는 등에 머물러 자신을 잊고, 뜰을 걸어도 남의 시선에 흔들리지 않으니 허물이 없습니다.',
      daXiangOriginal: '兼山 艮 君子以思不出其位',
      daXiangReading: '겸산 간 군자이사불출기위',
      daXiangMeaning: '두 산이 우뚝 겹쳐 서 있듯, 군자는 생각과 행동이 지금 자신이 맡은 자리와 본분을 넘어서지 않도록 지킵니다.',
      classicHanja: ['背', '庭', '思', '位']
    },
    53: {
      guaOriginal: '漸 女歸吉 利貞',
      guaReading: '점 여귀길 이정',
      guaMeaning: '여인이 예를 갖추어 시집가듯 차례와 순서를 밟아 나아가면 길하고 바름을 지킴이 이롭습니다.',
      daXiangOriginal: '山上有木 漸 君子以居賢德善俗',
      daXiangReading: '산상유목 점 군자이거현덕선속',
      daXiangMeaning: '산 위에 나무가 세월을 두고 자라나듯, 군자는 어진 덕에 머무르며 주변의 기풍을 점차 좋게 변화시킵니다.',
      classicHanja: ['居', '賢', '善', '俗']
    },
    54: {
      guaOriginal: '歸妹 征凶 无攸利',
      guaReading: '귀매 정흉 무유리',
      guaMeaning: '원칙과 순서에 맞지 않은 상태에서 감정만 앞서 나아가면 이롭지 않습니다.',
      daXiangOriginal: '澤上有雷 歸妹 君子以永終知敝',
      daXiangReading: '택상유뢰 귀매 군자이영종지폐',
      daXiangMeaning: '연못 위에서 우레가 울려 감정이 동하듯, 군자는 영원한 끝맺음을 생각해 처음부터 생길 폐단을 미리 헤아립니다.',
      classicHanja: ['永', '終', '知', '敝']
    },
    55: {
      guaOriginal: '豐 亨 王假之 勿憂 宜日中',
      guaReading: '풍 형 왕격지 물우 의일중',
      guaMeaning: '크게 풍성해져 형통하니 근심하지 말고 한낮의 태양처럼 밝고 공정하게 빛을 낼 때입니다.',
      daXiangOriginal: '雷電皆至 豐 君子以折獄致刑',
      daXiangReading: '뢰전개지 풍 군자이절옥치형',
      daXiangMeaning: '우레와 번개가 함께 이르듯, 군자는 밝은 통찰과 결단력으로 시비를 명쾌히 가려 바로잡습니다.',
      classicHanja: ['憂', '日', '折', '刑']
    },
    56: {
      guaOriginal: '旅 小亨 旅貞吉',
      guaReading: '려 소형 여정길',
      guaMeaning: '나그네의 처지에서는 작은 일부터 성실히 하고 바른 도리를 지키면 길합니다.',
      daXiangOriginal: '山上有火 旅 君子以明愼用刑 而不留獄',
      daXiangReading: '산상유화 려 군자이명신용형 이불류옥',
      daXiangMeaning: '산 위에 불길이 잠시 머물다 지나가듯, 군자는 밝고 신중하게 판단하되 일을 질질 끌며 지체하지 않습니다.',
      classicHanja: ['愼', '刑', '留', '明']
    },
    57: {
      guaOriginal: '巽 小亨 利有攸往 利見大人',
      guaReading: '손 소형 이유유왕 이견대인',
      guaMeaning: '부드럽게 스며들어 작은 일에서 형통하니 목표를 향해 나아가고 현명한 이를 만남이 이롭습니다.',
      daXiangOriginal: '隨風 巽 君子以申命行事',
      daXiangReading: '수풍 손 군자이신명행사',
      daXiangMeaning: '바람이 거듭 불어 구석구석 스며들듯, 군자는 뜻과 원칙을 거듭 분명히 알린 뒤 일을 실행합니다.',
      classicHanja: ['隨', '申', '命', '事']
    },
    58: {
      guaOriginal: '兌 亨 利貞',
      guaReading: '태 형 이정',
      guaMeaning: '서로 기쁨을 나누니 형통하며 바른 도리 안에서 기뻐할 때 이롭습니다.',
      daXiangOriginal: '麗澤 兌 君子以朋友講習',
      daXiangReading: '여택 태 군자이붕우강습',
      daXiangMeaning: '두 연못이 맞닿아 서로 물을 적셔주듯, 군자는 벗들과 함께 도리를 강론하고 익히며 기쁨을 나눕니다.',
      classicHanja: ['麗', '友', '講', '習']
    },
    59: {
      guaOriginal: '渙 亨 王假有廟 利涉大川 利貞',
      guaReading: '환 형 왕격유묘 이섭대천 이정',
      guaMeaning: '막힌 것이 흩어져 풀리니 형통하며, 바른 구심점을 세워 큰 일을 건너기 이롭습니다.',
      daXiangOriginal: '風行水上 渙 先王以享于帝 立廟',
      daXiangReading: '풍행수상 환 선왕이향우제 입묘',
      daXiangMeaning: '바람이 물 위를 불어 흩어진 기운을 녹이듯, 선왕은 지극한 정성을 모아 사람들의 마음을 하나로 묶어 세웁니다.',
      classicHanja: ['享', '立', '廟', '涉']
    },
    60: {
      guaOriginal: '節 亨 苦節不可貞',
      guaReading: '절 형 고절불가정',
      guaMeaning: '적절한 절제는 형통하게 하지만, 지나치게 괴롭고 가혹한 절제는 오래 지킬 수 없습니다.',
      daXiangOriginal: '澤上有水 節 君子以制數度 議德行',
      daXiangReading: '택상유수 절 군자이제수도 의덕행',
      daXiangMeaning: '연못 위에 물이 둑을 따라 알맞게 담기듯, 군자는 법도와 기준을 정하고 덕행을 헤아려 균형을 잡습니다.',
      classicHanja: ['苦', '制', '度', '議']
    },
    61: {
      guaOriginal: '中孚 豚魚吉 利涉大川 利貞',
      guaReading: '중부 돈어길 이섭대천 이정',
      guaMeaning: '마음속의 진실한 믿음은 미물까지 감동시켜 길하며 큰 어려움도 건널 수 있습니다.',
      daXiangOriginal: '澤上有風 中孚 君子以議獄緩死',
      daXiangReading: '택상유풍 중부 군자이의옥완사',
      daXiangMeaning: '연못 위로 바람이 불어 속까지 감응하듯, 군자는 신중히 사정을 헤아리고 성급한 심판을 늦추어 생명을 살핍니다.',
      classicHanja: ['豚', '魚', '議', '緩']
    },
    62: {
      guaOriginal: '小過 亨 利貞 可小事 不可大事 不宜上 宜下 大吉',
      guaReading: '소과 형 이정 가소사 불가대사 불의상 의하 대길',
      guaMeaning: '작은 일에는 가능하나 큰 일은 무리이며, 위로 오르기보다 아래로 낮출 때 크게 길합니다.',
      daXiangOriginal: '山上有雷 小過 君子以行過乎恭 喪過乎哀 用過乎儉',
      daXiangReading: '산상유뢰 소과 군자이행과호공 상과호애 용과호검',
      daXiangMeaning: '산 위에서 작은 우레가 울리듯, 군자는 행실은 조금 더 공손히, 슬픔은 조금 더 진실히, 쓰임은 조금 더 검소히 합니다.',
      classicHanja: ['恭', '喪', '哀', '儉']
    },
    63: {
      guaOriginal: '既濟 亨小 利貞 初吉終亂',
      guaReading: '기제 형소 이정 초길종란',
      guaMeaning: '작은 일까지 이루어져 바르게 지키면 이로우나, 처음은 순조로워도 끝에 방심하면 어지러워집니다.',
      daXiangOriginal: '水在火上 既濟 君子以思患而豫防之',
      daXiangReading: '수재화상 기제 군자이사환이예방지',
      daXiangMeaning: '물과 불이 만나 이미 요리를 이루었으나, 군자는 앞으로 올 수 있는 근심거리를 미리 생각하고 예방합니다.',
      classicHanja: ['亂', '患', '豫', '防']
    },
    64: {
      guaOriginal: '未濟 亨 小狐汔濟 濡其尾 无攸利',
      guaReading: '미제 형 소화흘제 유기미 무유리',
      guaMeaning: '형통하나 어린 여우가 강을 거의 다 건너다 꼬리를 적시듯 마지막 순간에 서두르면 이롭지 않습니다.',
      daXiangOriginal: '火在水上 未濟 君子以愼辨物居方',
      daXiangReading: '화재수상 미제 군자이신변물거방',
      daXiangMeaning: '불은 위에, 물은 아래에 있어 아직 어우러지지 않았으니, 군자는 사물을 신중히 분별해 각자 제자리에 두려 힘씁니다.',
      classicHanja: ['狐', '濡', '尾', '居']
    }
  };

  global.DailyIChing = global.DailyIChing || {};
  global.DailyIChing.HEXAGRAM_CLASSICS = HEXAGRAM_CLASSICS;
})(window);
