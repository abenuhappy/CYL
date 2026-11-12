// 한자 복습 퀴즈 및 플래시카드 생성 로직
(function (global) {
  'use strict';

  const ns = global.DailyIChing || {};

  function shuffleArray(list) {
    const arr = list.slice();
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
    return arr;
  }

  // 학습 대상 한자 목록 추출
  function getDeckChars(scope, todayHanjaChars) {
    const HANJA_DICT = ns.HANJA_DICT || {};
    const allKeys = Object.keys(HANJA_DICT);
    const summary = ns.storage ? ns.storage.getProgressSummary() : { studiedChars: [], wrongChars: [] };

    if (scope === 'today') {
      const valid = (todayHanjaChars || []).filter(function (ch) { return Boolean(HANJA_DICT[ch]); });
      if (valid.length > 0) return shuffleArray(valid);
      return shuffleArray(allKeys.slice(0, 8));
    }

    if (scope === 'wrong') {
      const wrong = summary.wrongChars.filter(function (ch) { return Boolean(HANJA_DICT[ch]); });
      return shuffleArray(wrong);
    }

    if (scope === 'studied') {
      const studied = summary.studiedChars.filter(function (ch) { return Boolean(HANJA_DICT[ch]); });
      if (studied.length > 0) return shuffleArray(studied);
      return shuffleArray(allKeys.slice(0, 12));
    }

    if (scope === 'trigrams') {
      const trigramChars = allKeys.filter(function (ch) {
        return HANJA_DICT[ch].category === '팔괘';
      });
      return shuffleArray(trigramChars);
    }

    if (scope === 'classics') {
      const classicChars = allKeys.filter(function (ch) {
        return HANJA_DICT[ch].category === '괘사대상';
      });
      return shuffleArray(classicChars);
    }

    return shuffleArray(allKeys);
  }

  // 4지선다 퀴즈 문제 목록 생성
  function buildMultipleChoiceQuestions(scope, todayHanjaChars, maxCount) {
    const HANJA_DICT = ns.HANJA_DICT || {};
    const allKeys = Object.keys(HANJA_DICT);
    const deck = getDeckChars(scope, todayHanjaChars);
    const limit = Math.min(maxCount || 10, deck.length);
    const selected = deck.slice(0, limit);

    return selected.map(function (ch) {
      const entry = HANJA_DICT[ch];
      const distractors = shuffleArray(allKeys.filter(function (other) {
        return other !== ch && (HANJA_DICT[other].sound !== entry.sound || HANJA_DICT[other].meaning !== entry.meaning);
      })).slice(0, 3);

      const options = shuffleArray([ch].concat(distractors)).map(function (optChar) {
        const item = HANJA_DICT[optChar];
        return {
          char: optChar,
          label: item.meaning + ' ' + item.sound,
          isCorrect: optChar === ch
        };
      });

      return {
        char: ch,
        entry: entry,
        options: options
      };
    });
  }

  ns.quiz = {
    getDeckChars: getDeckChars,
    buildMultipleChoiceQuestions: buildMultipleChoiceQuestions
  };
  global.DailyIChing = ns;
})(window);
