// 팔괘(八卦) 마스터 데이터 (효 순서는 아래에서 위로 [초효, 이효, 삼효], 1=양효, 0=음효)
(function (global) {
  'use strict';

  const TRIGRAMS = {
    qian: {
      id: 'qian',
      name: '건',
      hanja: '乾',
      nature: '하늘',
      natureHanja: '天',
      symbol: '☰',
      lines: [1, 1, 1],
      attribute: '건전함과 강건함',
      meaning: '스스로 쉬지 않고 움직이는 힘, 창조와 주도, 분명한 원칙과 결단을 상징합니다.',
      hanjaNote: '건(乾)은 하늘의 맑고 힘찬 기운이 뻗어 나감을 뜻합니다.'
    },
    kun: {
      id: 'kun',
      name: '곤',
      hanja: '坤',
      nature: '땅',
      natureHanja: '地',
      symbol: '☷',
      lines: [0, 0, 0],
      attribute: '유순함과 포용',
      meaning: '만물을 싣고 기르는 넉넉함, 뒷받침과 협력, 끈기 있는 실행을 상징합니다.',
      hanjaNote: '곤(坤)은 흙(土)이 사방으로 펼쳐져 만물을 품고 길러냄을 뜻합니다.'
    },
    zhen: {
      id: 'zhen',
      name: '진',
      hanja: '震',
      nature: '우레',
      natureHanja: '雷',
      symbol: '☳',
      lines: [1, 0, 0],
      attribute: '움직임과 분발',
      meaning: '봄의 첫 천둥처럼 정체를 깨고 일어나는 시작, 각성, 신속한 실행을 상징합니다.',
      hanjaNote: '진(震)은 비(雨)와 함께 울려 퍼지는 우레의 진동을 뜻합니다.'
    },
    xun: {
      id: 'xun',
      name: '손',
      hanja: '巽',
      nature: '바람',
      natureHanja: '風',
      symbol: '☴',
      lines: [0, 1, 1],
      attribute: '스며듦과 순응',
      meaning: '부드러운 바람처럼 구석구석 스며드는 설득, 유연한 조정, 꾸준한 침투를 상징합니다.',
      hanjaNote: '손(巽)은 두 사람이 나란히 몸을 낮추어 공손히 따르는 모양에서 왔습니다.'
    },
    kan: {
      id: 'kan',
      name: '감',
      hanja: '坎',
      nature: '물',
      natureHanja: '水',
      symbol: '☵',
      lines: [0, 1, 0],
      attribute: '험난함과 지혜',
      meaning: '깊은 골짜기를 흐르는 물처럼 어려움 속에서도 중심을 잃지 않는 지혜와 성실을 상징합니다.',
      hanjaNote: '감(坎)은 땅(土)이 깊게 패인 구덩이와 그 안을 채운 흐름을 뜻합니다.'
    },
    li: {
      id: 'li',
      name: '리',
      hanja: '離',
      nature: '불',
      natureHanja: '火',
      symbol: '☲',
      lines: [1, 0, 1],
      attribute: '밝음과 분별',
      meaning: '어둠을 비추는 불빛처럼 명철한 통찰, 아름다운 표현, 바른 곳에 의지함을 상징합니다.',
      hanjaNote: '리(離)는 밝게 빛나며 흩어져 비추고, 또한 서로 짝지어 붙음을 뜻합니다.'
    },
    gen: {
      id: 'gen',
      name: '간',
      hanja: '艮',
      nature: '산',
      natureHanja: '山',
      symbol: '☶',
      lines: [0, 0, 1],
      attribute: '멈춤과 안정을 지킴',
      meaning: '우뚝 솟은 산처럼 멈출 때를 아는 절제, 차분한 성찰, 흔들리지 않는 중심을 상징합니다.',
      hanjaNote: '간(艮)은 사람이 걸음을 멈추고 뒤를 돌아보며 경계를 삼는 모습에서 왔습니다.'
    },
    dui: {
      id: 'dui',
      name: '태',
      hanja: '兌',
      nature: '연못',
      natureHanja: '澤',
      symbol: '☱',
      lines: [1, 1, 0],
      attribute: '기쁨과 소통',
      meaning: '맑은 연못이 주변을 적시듯 기쁜 교류, 열린 대화, 부드러운 화목을 상징합니다.',
      hanjaNote: '태(兌)는 입을 열어 기쁘게 말하고 서로 마음을 나누는 모습을 뜻합니다.'
    }
  };

  // 3효 비트 문자열("111" 등)로 팔괘를 찾기 위한 역인덱스
  const TRIGRAM_BY_BITS = {};
  Object.keys(TRIGRAMS).forEach(function (key) {
    const bits = TRIGRAMS[key].lines.join('');
    TRIGRAM_BY_BITS[bits] = TRIGRAMS[key];
  });

  global.DailyIChing = global.DailyIChing || {};
  global.DailyIChing.TRIGRAMS = TRIGRAMS;
  global.DailyIChing.TRIGRAM_BY_BITS = TRIGRAM_BY_BITS;
  global.DailyIChing.TRIGRAM_ORDER = ['qian', 'kun', 'zhen', 'xun', 'kan', 'li', 'gen', 'dui'];
})(window);
