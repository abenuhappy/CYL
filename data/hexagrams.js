// 주역 64괘 통합 인덱스 및 조회 유틸리티
(function (global) {
  'use strict';

  const ns = global.DailyIChing || {};
  const TRIGRAMS = ns.TRIGRAMS || {};
  const classics = ns.HEXAGRAM_CLASSICS || {};
  const part1 = ns.HEXAGRAMS_PART_1 || [];
  const part2 = ns.HEXAGRAMS_PART_2 || [];

  const HEXAGRAMS = part1.concat(part2).map(function (hex) {
    const lowerTrigram = TRIGRAMS[hex.lower];
    const upperTrigram = TRIGRAMS[hex.upper];
    // 효 배치는 아래(초효)에서 위(상효) 순서
    const linesBinary = lowerTrigram.lines.concat(upperTrigram.lines);
    const classic = classics[hex.num] || {};
    const classicHanja = classic.classicHanja || [];
    // 괘명, 괘사 원문, 대상전 원문에서 등장하는 모든 고전 한자를 원문 등장 순서대로 추출 및 통합
    const textSources = [
      hex.hanjaName || '',
      classic.guaOriginal || '',
      classic.daXiangOriginal || '',
      (hex.hanja || []).join(''),
      (classicHanja || []).join('')
    ].join(' ');
    const extractedChars = textSources.match(/[\u4E00-\u9FFF]/g) || [];
    const combinedHanja = Array.from(new Set(extractedChars));

    return Object.assign({}, hex, classic, {
      linesBinary: linesBinary,
      bits: linesBinary.join(''),
      upperTrigram: upperTrigram,
      lowerTrigram: lowerTrigram,
      hanja: combinedHanja,
      classicHanja: classicHanja
    });
  });

  const HEXAGRAM_BY_NUM = {};
  const HEXAGRAM_BY_BITS = {};

  HEXAGRAMS.forEach(function (hex) {
    HEXAGRAM_BY_NUM[hex.num] = hex;
    HEXAGRAM_BY_BITS[hex.bits] = hex;
  });

  ns.HEXAGRAMS = HEXAGRAMS;
  ns.HEXAGRAM_BY_NUM = HEXAGRAM_BY_NUM;
  ns.HEXAGRAM_BY_BITS = HEXAGRAM_BY_BITS;
  global.DailyIChing = ns;
})(window);
