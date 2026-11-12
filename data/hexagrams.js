// 주역 64괘 통합 인덱스 및 조회 유틸리티
(function (global) {
  'use strict';

  const ns = global.DailyIChing || {};
  const TRIGRAMS = ns.TRIGRAMS || {};
  const part1 = ns.HEXAGRAMS_PART_1 || [];
  const part2 = ns.HEXAGRAMS_PART_2 || [];

  const HEXAGRAMS = part1.concat(part2).map(function (hex) {
    const lowerTrigram = TRIGRAMS[hex.lower];
    const upperTrigram = TRIGRAMS[hex.upper];
    // 효 배치는 아래(초효)에서 위(상효) 순서
    const linesBinary = lowerTrigram.lines.concat(upperTrigram.lines);
    return Object.assign({}, hex, {
      linesBinary: linesBinary,
      bits: linesBinary.join(''),
      upperTrigram: upperTrigram,
      lowerTrigram: lowerTrigram
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
