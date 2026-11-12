// 주역 작괘(동전 3개 6회 던지기) 및 본괘·변효·지괘 산출 로직
(function (global) {
  'use strict';

  const ns = global.DailyIChing || {};

  // 동전 1개 던지기: 앞(양)=3, 뒤(음)=2
  function flipCoin() {
    return Math.random() < 0.5 ? 3 : 2;
  }

  // 동전 3개 던져 1효 산출 (6:노음, 7:소양, 8:소음, 9:노양)
  function tossThreeCoins() {
    const coins = [flipCoin(), flipCoin(), flipCoin()];
    const sum = coins[0] + coins[1] + coins[2];
    const isYang = sum === 7 || sum === 9;
    const isChanging = sum === 6 || sum === 9;
    const labelMap = {
      6: '노음(변효)',
      7: '소양',
      8: '소음',
      9: '노양(변효)'
    };

    return {
      value: sum,
      coins: coins,
      isYang: isYang,
      isChanging: isChanging,
      label: labelMap[sum]
    };
  }

  // 6효를 한 번에 산출
  function castSixLines() {
    const throws = [];
    for (let i = 0; i < 6; i += 1) {
      throws.push(tossThreeCoins());
    }
    return throws;
  }

  // 변효 개수에 따른 주희 역학계몽 기반 핵심 해석 안내
  function getFocusGuidance(throws, changingIndices) {
    const count = changingIndices.length;

    if (count === 0) {
      return {
        ruleTitle: '변효 없음 (0개)',
        ruleDesc: '움직이는 변효가 없으므로 본괘의 괘사와 전체 흐름을 오늘의 중심 메시지로 삼습니다.',
        primaryLineIndex: null
      };
    }
    if (count === 1) {
      return {
        ruleTitle: '단일 변효 (1개)',
        ruleDesc: '변한 효가 하나이므로 그 효의 말씀을 오늘 가장 중요한 행동 지침으로 봅니다.',
        primaryLineIndex: changingIndices[0]
      };
    }
    if (count === 2) {
      return {
        ruleTitle: '두 개 변효 (2개)',
        ruleDesc: '두 변효를 함께 살피되, 전통 관례에 따라 위쪽 변효를 중심으로 해석합니다.',
        primaryLineIndex: changingIndices[1]
      };
    }
    if (count === 3) {
      return {
        ruleTitle: '세 개 변효 (3개)',
        ruleDesc: '변화가 반을 차지하므로 본괘(현재)와 지괘(방향)의 괘사를 나란히 비교해 읽습니다.',
        primaryLineIndex: changingIndices[1]
      };
    }
    if (count === 4) {
      const staticIndices = [];
      for (let i = 0; i < 6; i += 1) {
        if (!throws[i].isChanging) {
          staticIndices.push(i);
        }
      }
      return {
        ruleTitle: '네 개 변효 (4개)',
        ruleDesc: '변화가 크므로 지괘를 중심으로 보며, 변하지 않은 두 효 중 아래쪽 효를 참고합니다.',
        primaryLineIndex: staticIndices[0]
      };
    }
    if (count === 5) {
      let staticIndex = 0;
      for (let i = 0; i < 6; i += 1) {
        if (!throws[i].isChanging) {
          staticIndex = i;
          break;
        }
      }
      return {
        ruleTitle: '다섯 개 변효 (5개)',
        ruleDesc: '거의 모든 기운이 이동해 지괘를 주로 보며, 변하지 않은 유일한 효를 중심 축으로 삼습니다.',
        primaryLineIndex: staticIndex
      };
    }
    return {
      ruleTitle: '여섯 효 모두 변함 (6개)',
      ruleDesc: '전체 국면이 완전히 뒤바뀌는 때이므로 지괘의 괘사를 중심으로 새 방향을 살핍니다.',
      primaryLineIndex: null
    };
  }

  // 6효 결과를 바탕으로 본괘·변효·지괘 조합 생성
  function buildReading(throws, options) {
    const opts = options || {};
    const HEXAGRAM_BY_BITS = ns.HEXAGRAM_BY_BITS || {};
    const changingIndices = [];
    const baseBitsArr = [];
    const targetBitsArr = [];

    throws.forEach(function (item, idx) {
      baseBitsArr.push(item.isYang ? '1' : '0');
      const changedYang = item.isChanging ? !item.isYang : item.isYang;
      targetBitsArr.push(changedYang ? '1' : '0');
      if (item.isChanging) {
        changingIndices.push(idx);
      }
    });

    const baseBits = baseBitsArr.join('');
    const targetBits = targetBitsArr.join('');
    const baseHexagram = HEXAGRAM_BY_BITS[baseBits];
    const targetHexagram = changingIndices.length > 0 ? HEXAGRAM_BY_BITS[targetBits] : null;
    const focus = getFocusGuidance(throws, changingIndices);

    return {
      id: opts.id || ('rec_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)),
      date: opts.date || getLocalDateString(new Date()),
      createdAt: opts.createdAt || new Date().toISOString(),
      updatedAt: opts.updatedAt || new Date().toISOString(),
      question: (opts.question || '').trim(),
      method: opts.method || 'quick',
      throws: throws,
      baseNum: baseHexagram ? baseHexagram.num : 1,
      targetNum: targetHexagram ? targetHexagram.num : null,
      changingPositions: changingIndices.map(function (i) { return i + 1; }),
      changingIndices: changingIndices,
      focus: focus,
      memo: opts.memo || '',
      reflection: opts.reflection || ''
    };
  }

  // 저장된 기록 객체를 렌더링용 전체 읽기 객체로 복원
  function hydrateReading(record) {
    if (!record) return null;
    const HEXAGRAM_BY_NUM = ns.HEXAGRAM_BY_NUM || {};
    const baseHexagram = HEXAGRAM_BY_NUM[record.baseNum];
    const targetHexagram = record.targetNum ? HEXAGRAM_BY_NUM[record.targetNum] : null;
    const throws = record.throws || [];
    const changingIndices = [];
    throws.forEach(function (t, idx) {
      if (t.isChanging) changingIndices.push(idx);
    });
    const focus = getFocusGuidance(throws, changingIndices);

    return Object.assign({}, record, {
      baseHexagram: baseHexagram,
      targetHexagram: targetHexagram,
      changingIndices: changingIndices,
      focus: focus
    });
  }

  // YYYY-MM-DD 로컬 날짜 문자열 반환
  function getLocalDateString(dateObj) {
    const d = dateObj || new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  }

  ns.iching = {
    tossThreeCoins: tossThreeCoins,
    castSixLines: castSixLines,
    buildReading: buildReading,
    hydrateReading: hydrateReading,
    getLocalDateString: getLocalDateString
  };
  global.DailyIChing = ns;
})(window);
