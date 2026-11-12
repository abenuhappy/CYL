// 브라우저 localStorage 기반 기록 및 한자 학습 진도 관리 모듈
(function (global) {
  'use strict';

  const ns = global.DailyIChing || {};
  const STORAGE_KEY = 'daily_iching_app_v1';

  const DEFAULT_STATE = {
    records: [],
    hanjaProgress: {},
    quizStats: {
      totalAnswered: 0,
      totalCorrect: 0,
      wrongChars: []
    }
  };

  // 메모리 폴백 저장소 (스토리지 접근 차단 시 동작 보장)
  let memoryFallback = JSON.parse(JSON.stringify(DEFAULT_STATE));

  function loadState() {
    try {
      const raw = global.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return JSON.parse(JSON.stringify(DEFAULT_STATE));
      }
      const parsed = JSON.parse(raw);
      return {
        records: Array.isArray(parsed.records) ? parsed.records : [],
        hanjaProgress: parsed.hanjaProgress && typeof parsed.hanjaProgress === 'object' ? parsed.hanjaProgress : {},
        quizStats: {
          totalAnswered: parsed.quizStats && Number.isFinite(parsed.quizStats.totalAnswered) ? parsed.quizStats.totalAnswered : 0,
          totalCorrect: parsed.quizStats && Number.isFinite(parsed.quizStats.totalCorrect) ? parsed.quizStats.totalCorrect : 0,
          wrongChars: parsed.quizStats && Array.isArray(parsed.quizStats.wrongChars) ? parsed.quizStats.wrongChars : []
        }
      };
    } catch (err) {
      return JSON.parse(JSON.stringify(memoryFallback));
    }
  }

  function persistState(state) {
    memoryFallback = JSON.parse(JSON.stringify(state));
    try {
      global.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (err) {
      return false;
    }
  }

  // 작괘 기록 저장 (최신 순 정렬)
  function saveReadingRecord(reading) {
    const state = loadState();
    const recordToSave = {
      id: reading.id,
      date: reading.date,
      createdAt: reading.createdAt,
      updatedAt: new Date().toISOString(),
      question: reading.question || '',
      method: reading.method || 'quick',
      throws: reading.throws,
      baseNum: reading.baseNum,
      targetNum: reading.targetNum || null,
      changingPositions: reading.changingPositions || [],
      memo: reading.memo || '',
      reflection: reading.reflection || ''
    };

    const existingIdx = state.records.findIndex(function (r) { return r.id === recordToSave.id; });
    if (existingIdx >= 0) {
      state.records[existingIdx] = recordToSave;
    } else {
      state.records.unshift(recordToSave);
    }

    persistState(state);
    return recordToSave;
  }

  function updateRecordNotes(id, memo, reflection) {
    const state = loadState();
    const target = state.records.find(function (r) { return r.id === id; });
    if (!target) return null;
    target.memo = memo;
    target.reflection = reflection;
    target.updatedAt = new Date().toISOString();
    persistState(state);
    return target;
  }

  function deleteRecord(id) {
    const state = loadState();
    state.records = state.records.filter(function (r) { return r.id !== id; });
    persistState(state);
    return state.records;
  }

  function getRecords() {
    return loadState().records;
  }

  function getLatestRecordForDate(dateStr) {
    const records = getRecords();
    return records.find(function (r) { return r.date === dateStr; }) || null;
  }

  // 한자 노출 및 학습 기록 누적
  function markHanjaStudied(chars) {
    if (!Array.isArray(chars) || chars.length === 0) return;
    const state = loadState();
    const now = new Date().toISOString();
    chars.forEach(function (ch) {
      if (!state.hanjaProgress[ch]) {
        state.hanjaProgress[ch] = {
          seenCount: 0,
          correctCount: 0,
          wrongCount: 0,
          mastered: false,
          lastStudiedAt: now
        };
      }
      state.hanjaProgress[ch].seenCount += 1;
      state.hanjaProgress[ch].lastStudiedAt = now;
    });
    persistState(state);
  }

  // 퀴즈 또는 플래시카드 응답 결과 기록
  function recordHanjaReview(ch, isCorrect) {
    const state = loadState();
    const now = new Date().toISOString();
    if (!state.hanjaProgress[ch]) {
      state.hanjaProgress[ch] = {
        seenCount: 1,
        correctCount: 0,
        wrongCount: 0,
        mastered: false,
        lastStudiedAt: now
      };
    }

    const entry = state.hanjaProgress[ch];
    entry.lastStudiedAt = now;
    state.quizStats.totalAnswered += 1;

    if (isCorrect) {
      entry.correctCount += 1;
      state.quizStats.totalCorrect += 1;
      // 2회 이상 맞히고 오답 목록에 있으면 제거
      if (entry.correctCount >= 2 || state.quizStats.wrongChars.indexOf(ch) >= 0) {
        entry.mastered = entry.correctCount >= 2;
        state.quizStats.wrongChars = state.quizStats.wrongChars.filter(function (item) { return item !== ch; });
      }
    } else {
      entry.wrongCount += 1;
      entry.mastered = false;
      if (state.quizStats.wrongChars.indexOf(ch) === -1) {
        state.quizStats.wrongChars.push(ch);
      }
    }

    persistState(state);
    return state;
  }

  function getProgressSummary() {
    const state = loadState();
    const studiedKeys = Object.keys(state.hanjaProgress);
    const masteredCount = studiedKeys.filter(function (k) {
      return state.hanjaProgress[k].mastered;
    }).length;

    return {
      studiedChars: studiedKeys,
      studiedCount: studiedKeys.length,
      masteredCount: masteredCount,
      wrongChars: state.quizStats.wrongChars.slice(),
      totalAnswered: state.quizStats.totalAnswered,
      totalCorrect: state.quizStats.totalCorrect,
      hanjaProgress: state.hanjaProgress
    };
  }

  // JSON 백업 내보내기
  function exportBackupJson() {
    const state = loadState();
    return JSON.stringify({
      version: 1,
      exportedAt: new Date().toISOString(),
      data: state
    }, null, 2);
  }

  // JSON 백업 복원 (구조 검증 포함)
  function importBackupJson(rawText) {
    const parsed = JSON.parse(rawText);
    const payload = parsed && parsed.data ? parsed.data : parsed;
    if (!payload || !Array.isArray(payload.records)) {
      throw new Error('올바른 주역 기록 백업 형식이 아닙니다.');
    }

    const current = loadState();
    const mergedMap = {};
    current.records.forEach(function (r) { mergedMap[r.id] = r; });
    payload.records.forEach(function (r) {
      if (r && r.id && Number.isInteger(r.baseNum)) {
        mergedMap[r.id] = r;
      }
    });

    const mergedRecords = Object.keys(mergedMap).map(function (id) {
      return mergedMap[id];
    }).sort(function (a, b) {
      return String(b.createdAt).localeCompare(String(a.createdAt));
    });

    const mergedProgress = Object.assign({}, current.hanjaProgress, payload.hanjaProgress || {});
    const nextState = {
      records: mergedRecords,
      hanjaProgress: mergedProgress,
      quizStats: payload.quizStats && Array.isArray(payload.quizStats.wrongChars)
        ? payload.quizStats
        : current.quizStats
    };
    persistState(nextState);
    return mergedRecords.length;
  }

  ns.storage = {
    loadState: loadState,
    saveReadingRecord: saveReadingRecord,
    updateRecordNotes: updateRecordNotes,
    deleteRecord: deleteRecord,
    getRecords: getRecords,
    getLatestRecordForDate: getLatestRecordForDate,
    markHanjaStudied: markHanjaStudied,
    recordHanjaReview: recordHanjaReview,
    getProgressSummary: getProgressSummary,
    exportBackupJson: exportBackupJson,
    importBackupJson: importBackupJson
  };
  global.DailyIChing = ns;
})(window);
