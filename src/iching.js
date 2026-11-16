// 주역 강독 및 64괘 조회·학습 로직
(function (global) {
  'use strict';

  const ns = global.DailyIChing || {};

  // YYYY-MM-DD 로컬 날짜 문자열 반환
  function getLocalDateString(dateObj) {
    const d = dateObj || new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  }

  // 날짜 기반 일일 추천 괘 번호 (1~64 순환)
  function getDailyHexagramNum(dateObj) {
    const d = dateObj || new Date();
    const start = new Date(d.getFullYear(), 0, 0);
    const diff = d - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return ((dayOfYear - 1) % 64) + 1;
  }

  // 강독 학습 객체 생성
  function buildStudyReading(hexNum, options) {
    const opts = options || {};
    const HEXAGRAM_BY_NUM = ns.HEXAGRAM_BY_NUM || {};
    const num = Math.min(64, Math.max(1, parseInt(hexNum, 10) || 1));
    const hex = HEXAGRAM_BY_NUM[num] || HEXAGRAM_BY_NUM[1];

    return {
      id: opts.id || ('study_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)),
      date: opts.date || getLocalDateString(new Date()),
      createdAt: opts.createdAt || new Date().toISOString(),
      updatedAt: opts.updatedAt || new Date().toISOString(),
      hexNum: hex.num,
      baseNum: hex.num, // 호환성 유지
      method: opts.method || 'study',
      memo: opts.memo || '',
      reflection: opts.reflection || '',
      completed: Boolean(opts.completed)
    };
  }

  // 저장된 기록 객체를 렌더링용 객체로 복원
  function hydrateReading(record) {
    if (!record) return null;
    const HEXAGRAM_BY_NUM = ns.HEXAGRAM_BY_NUM || {};
    const hexNum = record.hexNum || record.baseNum || 1;
    const hex = HEXAGRAM_BY_NUM[hexNum] || HEXAGRAM_BY_NUM[1];

    return Object.assign({}, record, {
      hexNum: hex.num,
      baseNum: hex.num,
      hexagram: hex,
      baseHexagram: hex
    });
  }

  ns.iching = {
    getLocalDateString: getLocalDateString,
    getDailyHexagramNum: getDailyHexagramNum,
    buildStudyReading: buildStudyReading,
    hydrateReading: hydrateReading
  };
  global.DailyIChing = ns;
})(window);
