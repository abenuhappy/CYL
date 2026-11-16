// 주역 강독과 한자 공부 웹 애플리케이션 메인 컨트롤러
(function (global) {
  'use strict';

  const ns = global.DailyIChing || {};
  const TRIGRAMS = ns.TRIGRAMS || {};
  const TRIGRAM_ORDER = ns.TRIGRAM_ORDER || [];
  const HANJA_DICT = ns.HANJA_DICT || {};
  const HEXAGRAMS = ns.HEXAGRAMS || [];
  const HEXAGRAM_BY_NUM = ns.HEXAGRAM_BY_NUM || {};
  const iching = ns.iching;
  const storage = ns.storage;
  const quiz = ns.quiz;

  const TAB_TITLES = {
    'tab-today': '오늘의 강독 | 주역 강독과 한자 공부',
    'tab-hanja': '한자 공부 | 주역 강독과 한자 공부',
    'tab-quiz': '복습 퀴즈 | 주역 강독과 한자 공부',
    'tab-history': '나의 학습장 | 주역 강독과 한자 공부',
    'tab-encyclopedia': '64괘 강독 | 주역 강독과 한자 공부',
    'tab-help': '주역 입문 | 주역 강독과 한자 공부'
  };

  // 현재 앱 상태
  const appState = {
    currentReading: null,
    currentHexNum: 1,
    pendingDeleteId: null,
    quizSession: null
  };

  // DOM 유틸리티: 안전한 엘리먼트 생성
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }

  function clearEl(node) {
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  }

  function announce(message) {
    const live = document.getElementById('live-status');
    if (!live) return;
    live.textContent = '';
    global.setTimeout(function () {
      live.textContent = message;
    }, 30);
  }

  function formatKoreanDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return Number(parts[0]) + '년 ' + Number(parts[1]) + '월 ' + Number(parts[2]) + '일';
  }

  // 현재 강독 괘와 연관된 한자 목록 추출
  function getReadingHanjaChars(reading) {
    if (!reading) return [];
    const hex = reading.hexagram || reading.baseHexagram;
    if (hex && Array.isArray(hex.hanja)) {
      return hex.hanja.filter(function (ch) { return Boolean(HANJA_DICT[ch]); });
    }
    return [];
  }

  // 6효 시각화 막대 렌더링 (1=양효, 0=음효)
  function renderHexVisual(container, linesBinary) {
    clearEl(container);
    (linesBinary || []).forEach(function (bit) {
      const bar = el('div', 'hex-line-bar ' + (bit === 1 ? 'yang' : 'yin'));
      container.appendChild(bar);
    });
  }

  function renderMiniHexVisual(linesBinary) {
    const wrap = el('div', 'hex-mini-lines');
    wrap.setAttribute('aria-hidden', 'true');
    (linesBinary || []).forEach(function (bit) {
      wrap.appendChild(el('div', 'hex-mini-bar ' + (bit === 1 ? 'yang' : 'yin')));
    });
    return wrap;
  }

  // ==========================================
  // 1. 탭 전환 및 접근성 키보드 네비게이션
  // ==========================================
  function initTabs() {
    const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
    const panels = Array.from(document.querySelectorAll('[role="tabpanel"]'));

    function activateTab(targetTab, shouldFocus) {
      tabs.forEach(function (tab) {
        const selected = tab === targetTab;
        tab.setAttribute('aria-selected', selected ? 'true' : 'false');
        tab.setAttribute('tabindex', selected ? '0' : '-1');
      });

      panels.forEach(function (panel) {
        const isTarget = panel.getAttribute('aria-labelledby') === targetTab.id;
        if (isTarget) {
          panel.removeAttribute('hidden');
          panel.setAttribute('tabindex', '0');
        } else {
          panel.setAttribute('hidden', 'until-found');
          panel.removeAttribute('tabindex');
        }
      });

      document.title = TAB_TITLES[targetTab.id] || '주역 강독과 한자 공부';
      targetTab.scrollIntoView({ block: 'nearest', inline: 'nearest' });

      if (shouldFocus) {
        targetTab.focus();
      }

      // 탭 진입 시 최신 상태 반영
      if (targetTab.id === 'tab-hanja') {
        renderTodayHanjaSection();
      } else if (targetTab.id === 'tab-quiz') {
        renderQuizStats();
      } else if (targetTab.id === 'tab-history') {
        renderHistorySection();
      }
    }

    tabs.forEach(function (tab, index) {
      tab.addEventListener('click', function () {
        activateTab(tab, false);
      });

      tab.addEventListener('keydown', function (e) {
        let nextIndex = null;
        if (e.key === 'ArrowRight') {
          nextIndex = (index + 1) % tabs.length;
        } else if (e.key === 'ArrowLeft') {
          nextIndex = (index - 1 + tabs.length) % tabs.length;
        } else if (e.key === 'Home') {
          nextIndex = 0;
        } else if (e.key === 'End') {
          nextIndex = tabs.length - 1;
        }
        if (nextIndex !== null) {
          e.preventDefault();
          activateTab(tabs[nextIndex], true);
        }
      });
    });

    panels.forEach(function (panel) {
      panel.addEventListener('beforematch', function () {
        const tabId = panel.getAttribute('aria-labelledby');
        const targetTab = document.getElementById(tabId);
        if (targetTab) activateTab(targetTab, false);
      });
    });

    return { activateTab: activateTab };
  }

  // ==========================================
  // 2. 오늘의 강독 렌더링 및 네비게이션
  // ==========================================
  function renderReading(reading) {
    if (!reading) return;
    const hex = reading.hexagram || reading.baseHexagram || HEXAGRAM_BY_NUM[reading.hexNum || 1];
    if (!hex) return;

    // 메타 바
    document.getElementById('reading-date-tag').textContent = formatKoreanDate(reading.date);
    document.getElementById('reading-hex-tag').textContent = hex.num + '번째 괘 · ' + hex.name;

    const completeBtn = document.getElementById('btn-toggle-complete');
    if (reading.completed) {
      completeBtn.textContent = '강독 완료됨';
      completeBtn.classList.add('btn-completed');
    } else {
      completeBtn.textContent = '강독 완료 체크';
      completeBtn.classList.remove('btn-completed');
    }

    // 괘 상징 시각화
    renderHexVisual(document.getElementById('base-hex-visual'), hex.linesBinary);
    document.getElementById('base-hex-title').textContent = hex.num + '괘 ' + hex.name + ' (' + hex.hanjaName + ')';
    document.getElementById('base-hex-trigrams').textContent =
      '상괘 ' + hex.upperTrigram.name + '(' + hex.upperTrigram.nature + ') · 하괘 ' +
      hex.lowerTrigram.name + '(' + hex.lowerTrigram.nature + ')';

    const baseKeywords = document.getElementById('base-hex-keywords');
    clearEl(baseKeywords);
    (hex.keywords || []).forEach(function (kw) {
      baseKeywords.appendChild(el('span', 'keyword-pill', kw));
    });

    document.getElementById('hex-summary-text').textContent = hex.summary;

    // 괘사 (卦辭)
    document.getElementById('hex-gua-original').textContent = hex.guaOriginal;
    document.getElementById('hex-gua-reading').textContent = '음독: ' + hex.guaReading;
    document.getElementById('hex-gua-meaning').textContent = hex.guaMeaning;

    // 대상전 (大象傳)
    document.getElementById('hex-daxiang-original').textContent = hex.daXiangOriginal;
    document.getElementById('hex-daxiang-reading').textContent = '음독: ' + hex.daXiangReading;
    document.getElementById('hex-daxiang-meaning').textContent = hex.daXiangMeaning;

    // 원문 속 핵심 한자 미리보기
    renderTodayHanjaPreview(reading);

    // 6효 전체 해설
    const allLinesList = document.getElementById('all-lines-list');
    clearEl(allLinesList);
    (hex.lines || []).forEach(function (lineData) {
      const row = el('div', 'line-item-row');
      row.appendChild(el('strong', '', lineData.title));
      row.appendChild(el('p', '', lineData.meaning));
      row.appendChild(el('p', 'muted-text', '처신 지침: ' + lineData.action));
      allLinesList.appendChild(row);
    });

    // 드롭다운 선택값 동기화
    const select = document.getElementById('study-hex-select');
    if (select) {
      select.value = String(hex.num);
    }
  }

  function renderTodayHanjaPreview(reading) {
    const container = document.getElementById('today-hanja-preview');
    clearEl(container);
    const chars = getReadingHanjaChars(reading);

    chars.forEach(function (ch) {
      const entry = HANJA_DICT[ch];
      if (!entry) return;
      const card = el('div', 'hanja-mini-card');
      const glyph = el('span', 'hanja-glyph-lg', entry.char);
      glyph.setAttribute('lang', 'zh-Hant');
      card.appendChild(glyph);
      card.appendChild(el('span', 'hanja-reading', entry.meaning + ' ' + entry.sound));
      card.appendChild(el('span', 'hanja-sub-meta', entry.radical + ' · ' + entry.strokes + '획'));
      container.appendChild(card);
    });
  }

  function loadHexagramStudy(num, tabController) {
    const targetNum = Math.min(64, Math.max(1, parseInt(num, 10) || 1));
    const todayStr = iching.getLocalDateString(new Date());

    const records = storage.getRecords();
    const existing = records.find(function (r) {
      return (r.hexNum === targetNum || r.baseNum === targetNum) && r.date === todayStr;
    });

    let reading = null;
    if (existing) {
      reading = iching.hydrateReading(existing);
    } else {
      const raw = iching.buildStudyReading(targetNum, { date: todayStr });
      reading = iching.hydrateReading(raw);
    }

    appState.currentReading = reading;
    appState.currentHexNum = targetNum;

    // 강독 중인 괘의 한자 학습 자동 반영
    const chars = getReadingHanjaChars(reading);
    storage.markHanjaStudied(chars);

    renderReading(reading);
    renderTodayHanjaSection();
    if (tabController) {
      renderHistorySection(tabController);
    }
    announce(reading.hexagram.num + '괘 ' + reading.hexagram.name + ' 강독이 준비되었습니다.');
  }

  function initTodayTab(tabController) {
    const select = document.getElementById('study-hex-select');
    const prevBtn = document.getElementById('btn-prev-hex');
    const nextBtn = document.getElementById('btn-next-hex');
    const randomBtn = document.getElementById('btn-random-hex');
    const todayDefaultBtn = document.getElementById('btn-today-default');
    const toggleCompleteBtn = document.getElementById('btn-toggle-complete');
    const markTodayBtn = document.getElementById('btn-mark-today-studied');
    const goQuizBtn = document.getElementById('btn-go-quiz-today');

    // 64괘 선택기 옵션 채우기
    clearEl(select);
    HEXAGRAMS.forEach(function (h) {
      const opt = el('option', '', h.num + '. ' + h.name + ' (' + h.hanjaName + ') — ' + (h.keywords.slice(0, 2).join(', ')));
      opt.value = String(h.num);
      select.appendChild(opt);
    });

    select.addEventListener('change', function () {
      loadHexagramStudy(this.value, tabController);
    });

    prevBtn.addEventListener('click', function () {
      const prevNum = (appState.currentHexNum - 2 + 64) % 64 + 1;
      loadHexagramStudy(prevNum, tabController);
    });

    nextBtn.addEventListener('click', function () {
      const nextNum = (appState.currentHexNum % 64) + 1;
      loadHexagramStudy(nextNum, tabController);
    });

    randomBtn.addEventListener('click', function () {
      const randomNum = Math.floor(Math.random() * 64) + 1;
      loadHexagramStudy(randomNum, tabController);
    });

    todayDefaultBtn.addEventListener('click', function () {
      const todayNum = iching.getDailyHexagramNum(new Date());
      loadHexagramStudy(todayNum, tabController);
    });

    toggleCompleteBtn.addEventListener('click', function () {
      if (!appState.currentReading) return;
      appState.currentReading.completed = !appState.currentReading.completed;
      storage.saveReadingRecord(appState.currentReading);
      renderReading(appState.currentReading);
      renderHistorySection(tabController);
      announce(appState.currentReading.completed ? '오늘의 강독을 완료로 표시했습니다.' : '강독 완료를 취소했습니다.');
    });

    markTodayBtn.addEventListener('click', function () {
      const chars = getReadingHanjaChars(appState.currentReading);
      if (chars.length === 0) {
        announce('강독 괘를 먼저 선택해 주세요.');
        return;
      }
      storage.markHanjaStudied(chars);
      renderQuizStats();
      announce('강독 괘 한자 ' + chars.length + '자를 복습장에 담았습니다.');
    });

    goQuizBtn.addEventListener('click', function () {
      document.getElementById('quiz-scope-select').value = 'today';
      tabController.activateTab(document.getElementById('tab-quiz'), true);
      startQuizSession('choice', 'today');
    });
  }

  // ==========================================
  // 3. 한자 공부 탭
  // ==========================================
  function createHanjaDetailCard(entry) {
    const card = el('article', 'hanja-detail-card');
    const top = el('div', 'hanja-card-top');
    const glyphBox = el('div', 'hanja-glyph-box', entry.char);
    glyphBox.setAttribute('lang', 'zh-Hant');

    const titleInfo = el('div', 'hanja-title-info');
    titleInfo.appendChild(el('h3', '', entry.meaning + ' ' + entry.sound));
    titleInfo.appendChild(el('div', 'hanja-meta-line', '부수 ' + entry.radical + ' · ' + entry.strokes + '획 · ' + entry.category));

    top.appendChild(glyphBox);
    top.appendChild(titleInfo);
    card.appendChild(top);
    card.appendChild(el('p', 'hanja-note', entry.note));
    if (entry.words && entry.words.length > 0) {
      card.appendChild(el('div', 'hanja-words', '관련 어휘: ' + entry.words.join(', ')));
    }
    return card;
  }

  function renderTodayHanjaSection() {
    const grid = document.getElementById('hanja-today-grid');
    clearEl(grid);
    let chars = getReadingHanjaChars(appState.currentReading);
    if (chars.length === 0) {
      chars = ['乾', '坤', '震', '巽', '坎', '離', '艮', '兌'];
    }
    chars.forEach(function (ch) {
      if (HANJA_DICT[ch]) {
        grid.appendChild(createHanjaDetailCard(HANJA_DICT[ch]));
      }
    });
  }

  function renderTrigramGrid() {
    const grid = document.getElementById('trigram-study-grid');
    clearEl(grid);
    TRIGRAM_ORDER.forEach(function (id) {
      const tri = TRIGRAMS[id];
      const card = el('article', 'trigram-card');
      const top = el('div', 'trigram-top');
      const sym = el('span', 'trigram-symbol', tri.symbol);
      sym.setAttribute('aria-hidden', 'true');
      top.appendChild(sym);
      top.appendChild(el('h3', '', tri.name + ' (' + tri.hanja + ') — ' + tri.nature + ' (' + tri.natureHanja + ')'));
      card.appendChild(top);
      card.appendChild(el('p', '', '성질: ' + tri.attribute));
      card.appendChild(el('p', 'muted-text', tri.meaning));
      grid.appendChild(card);
    });
  }

  function renderHanjaDictionary() {
    const query = document.getElementById('hanja-search-input').value.trim().toLowerCase();
    const category = document.getElementById('hanja-category-select').value;
    const grid = document.getElementById('hanja-dict-grid');
    const countInfo = document.getElementById('hanja-count-info');

    clearEl(grid);
    const items = Object.keys(HANJA_DICT).map(function (k) { return HANJA_DICT[k]; }).filter(function (entry) {
      if (category !== 'all' && entry.category !== category) return false;
      if (!query) return true;
      const haystack = (entry.char + ' ' + entry.sound + ' ' + entry.meaning + ' ' + entry.note + ' ' + (entry.words || []).join(' ')).toLowerCase();
      return haystack.indexOf(query) !== -1;
    });

    countInfo.textContent = '총 ' + items.length + '자의 한자가 표시되었습니다.';
    items.forEach(function (entry) {
      grid.appendChild(createHanjaDetailCard(entry));
    });
  }

  function initHanjaTab() {
    renderTodayHanjaSection();
    renderTrigramGrid();
    renderHanjaDictionary();

    const searchInput = document.getElementById('hanja-search-input');
    const categorySelect = document.getElementById('hanja-category-select');
    const filterForm = document.getElementById('hanja-filter-form');

    filterForm.addEventListener('submit', function (e) { e.preventDefault(); });
    searchInput.addEventListener('input', renderHanjaDictionary);
    categorySelect.addEventListener('change', renderHanjaDictionary);

    const subMarkBtn = document.getElementById('btn-mark-today-studied-sub');
    if (subMarkBtn) {
      subMarkBtn.addEventListener('click', function () {
        const chars = getReadingHanjaChars(appState.currentReading);
        if (chars.length === 0) {
          announce('강독 괘를 먼저 선택해 주세요.');
          return;
        }
        storage.markHanjaStudied(chars);
        renderQuizStats();
        announce('강독 괘 한자 ' + chars.length + '자를 복습장에 담았습니다.');
      });
    }
  }

  // ==========================================
  // 4. 한자 복습 퀴즈 및 플래시카드
  // ==========================================
  function renderQuizStats() {
    const bar = document.getElementById('quiz-stats-bar');
    clearEl(bar);
    const summary = storage.getProgressSummary();
    const accuracy = summary.totalAnswered > 0
      ? Math.round((summary.totalCorrect / summary.totalAnswered) * 100) + '%'
      : '0%';

    const tiles = [
      { label: '학습한 한자', value: summary.studiedCount + '자' },
      { label: '익힘 완료', value: summary.masteredCount + '자' },
      { label: '오답 대기', value: summary.wrongChars.length + '자' },
      { label: '누적 정답률', value: accuracy }
    ];

    tiles.forEach(function (t) {
      const tile = el('div', 'stat-tile');
      tile.appendChild(el('span', 'stat-label', t.label));
      tile.appendChild(el('span', 'stat-value', t.value));
      bar.appendChild(tile);
    });
  }

  function startQuizSession(mode, scope) {
    const todayChars = getReadingHanjaChars(appState.currentReading);
    const stageCard = document.getElementById('quiz-stage-card');
    const stageContent = document.getElementById('quiz-stage-content');
    clearEl(stageContent);

    if (mode === 'flashcard') {
      const deck = quiz.getDeckChars(scope, todayChars);
      if (deck.length === 0) {
        stageCard.hidden = false;
        stageContent.appendChild(el('p', 'muted-text', '선택한 범위에 복습할 한자가 없습니다. 다른 범위를 선택해 주세요.'));
        return;
      }
      appState.quizSession = {
        mode: 'flashcard',
        scope: scope,
        deck: deck,
        index: 0,
        revealed: false,
        showHint: false,
        knownCount: 0
      };
      stageCard.hidden = false;
      renderFlashcardStep();
      return;
    }

    const questions = quiz.buildMultipleChoiceQuestions(scope, todayChars, 10);
    if (questions.length === 0) {
      stageCard.hidden = false;
      stageContent.appendChild(el('p', 'muted-text', '선택한 범위에 출제할 한자가 없습니다. 다른 범위를 선택해 주세요.'));
      return;
    }

    appState.quizSession = {
      mode: 'choice',
      scope: scope,
      questions: questions,
      index: 0,
      answered: false,
      correctCount: 0
    };
    stageCard.hidden = false;
    renderChoiceStep();
  }

  function renderFlashcardStep() {
    const s = appState.quizSession;
    const stageContent = document.getElementById('quiz-stage-content');
    clearEl(stageContent);

    if (s.index >= s.deck.length) {
      stageContent.appendChild(el('h3', '', '플래시카드 복습 완료'));
      stageContent.appendChild(el('p', '', '총 ' + s.deck.length + '자 중 ' + s.knownCount + '자를 잘 알고 있음으로 표시했습니다.'));
      const actions = el('div', 'quiz-actions-center');
      const retryBtn = el('button', 'btn btn-primary', '같은 범위 다시 복습');
      retryBtn.type = 'button';
      retryBtn.addEventListener('click', function () { startQuizSession('flashcard', s.scope); });
      actions.appendChild(retryBtn);
      stageContent.appendChild(actions);
      renderQuizStats();
      return;
    }

    const ch = s.deck[s.index];
    const entry = HANJA_DICT[ch];
    const header = el('div', 'quiz-header-bar');
    header.appendChild(el('span', '', '플래시카드 (' + (s.index + 1) + ' / ' + s.deck.length + ')'));
    header.appendChild(el('span', '', '분류: ' + entry.category));
    stageContent.appendChild(header);

    const box = el('div', 'flashcard-box');
    const glyph = el('div', 'quiz-prompt-char', entry.char);
    glyph.setAttribute('lang', 'zh-Hant');
    box.appendChild(glyph);

    if (s.showHint) {
      box.appendChild(el('p', 'quiz-hint-text', '힌트: 부수 ' + entry.radical + ' · ' + entry.strokes + '획'));
    } else if (!s.revealed) {
      const hintBtn = el('button', 'btn btn-ghost btn-small', '부수·획수 힌트 보기');
      hintBtn.type = 'button';
      hintBtn.addEventListener('click', function () {
        s.showHint = true;
        renderFlashcardStep();
      });
      box.appendChild(hintBtn);
    }

    if (!s.revealed) {
      const revealWrap = el('div', 'quiz-actions-center');
      const revealBtn = el('button', 'btn btn-primary', '뜻과 풀이 확인하기');
      revealBtn.type = 'button';
      revealBtn.addEventListener('click', function () {
        s.revealed = true;
        renderFlashcardStep();
      });
      revealWrap.appendChild(revealBtn);
      box.appendChild(revealWrap);
    } else {
      const back = el('div', 'flashcard-back');
      back.appendChild(el('h3', '', entry.meaning + ' ' + entry.sound));
      back.appendChild(el('p', '', entry.note));
      if (entry.words && entry.words.length > 0) {
        back.appendChild(el('p', 'hanja-words', '관련 어휘: ' + entry.words.join(', ')));
      }
      const rateWrap = el('div', 'quiz-actions-center');
      const againBtn = el('button', 'btn btn-secondary', '다시 복습 필요');
      againBtn.type = 'button';
      againBtn.addEventListener('click', function () {
        storage.recordHanjaReview(ch, false);
        s.index += 1;
        s.revealed = false;
        s.showHint = false;
        renderFlashcardStep();
      });
      const knowBtn = el('button', 'btn btn-primary', '잘 알고 있음');
      knowBtn.type = 'button';
      knowBtn.addEventListener('click', function () {
        storage.recordHanjaReview(ch, true);
        s.knownCount += 1;
        s.index += 1;
        s.revealed = false;
        s.showHint = false;
        renderFlashcardStep();
      });
      rateWrap.appendChild(againBtn);
      rateWrap.appendChild(knowBtn);
      back.appendChild(rateWrap);
      box.appendChild(back);
    }

    stageContent.appendChild(box);
  }

  function renderChoiceStep() {
    const s = appState.quizSession;
    const stageContent = document.getElementById('quiz-stage-content');
    clearEl(stageContent);

    if (s.index >= s.questions.length) {
      stageContent.appendChild(el('h3', '', '한자 퀴즈 결과'));
      stageContent.appendChild(el('p', 'lead-text', s.questions.length + '문제 중 ' + s.correctCount + '문제를 맞혔습니다.'));
      const actions = el('div', 'quiz-actions-center');
      const retryBtn = el('button', 'btn btn-primary', '새 문제 풀기');
      retryBtn.type = 'button';
      retryBtn.addEventListener('click', function () { startQuizSession('choice', s.scope); });
      actions.appendChild(retryBtn);

      const summary = storage.getProgressSummary();
      if (summary.wrongChars.length > 0) {
        const wrongBtn = el('button', 'btn btn-secondary', '오답 ' + summary.wrongChars.length + '자 집중 복습');
        wrongBtn.type = 'button';
        wrongBtn.addEventListener('click', function () {
          document.getElementById('quiz-scope-select').value = 'wrong';
          startQuizSession('choice', 'wrong');
        });
        actions.appendChild(wrongBtn);
      }
      stageContent.appendChild(actions);
      renderQuizStats();
      return;
    }

    const q = s.questions[s.index];
    const header = el('div', 'quiz-header-bar');
    header.appendChild(el('span', '', '객관식 퀴즈 (' + (s.index + 1) + ' / ' + s.questions.length + ')'));
    header.appendChild(el('span', '', '현재 점수: ' + s.correctCount + '점'));
    stageContent.appendChild(header);

    const questionBox = el('div', 'quiz-question-box');
    const glyph = el('div', 'quiz-prompt-char', q.char);
    glyph.setAttribute('lang', 'zh-Hant');
    questionBox.appendChild(glyph);
    questionBox.appendChild(el('p', 'quiz-sub-prompt', '다음 한자의 올바른 음과 훈(뜻)을 고르세요.'));
    stageContent.appendChild(questionBox);

    const optionsGrid = el('div', 'quiz-options-grid');
    const feedbackBox = el('div', 'quiz-step-feedback');

    q.options.forEach(function (opt) {
      const btn = el('button', 'quiz-option-btn', opt.label);
      btn.type = 'button';
      btn.addEventListener('click', function () {
        if (s.answered) return;
        s.answered = true;
        const isCorrect = opt.isCorrect;
        storage.recordHanjaReview(q.char, isCorrect);

        if (isCorrect) {
          s.correctCount += 1;
          btn.classList.add('is-correct');
          feedbackBox.appendChild(el('p', 'feedback-text is-correct', '정답입니다! ' + q.entry.char + ' : ' + q.entry.meaning + ' ' + q.entry.sound));
        } else {
          btn.classList.add('is-wrong');
          feedbackBox.appendChild(el('p', 'feedback-text is-wrong', '오답입니다. 정답은 [' + q.entry.meaning + ' ' + q.entry.sound + '] 입니다.'));
          Array.from(optionsGrid.children).forEach(function (child) {
            if (child.textContent === q.entry.meaning + ' ' + q.entry.sound) {
              child.classList.add('is-correct');
            }
          });
        }

        const note = el('p', 'quiz-note-text', q.entry.note);
        feedbackBox.appendChild(note);

        const nextWrap = el('div', 'quiz-actions-center');
        const nextBtn = el('button', 'btn btn-primary', s.index + 1 < s.questions.length ? '다음 문제' : '결과 확인하기');
        nextBtn.type = 'button';
        nextBtn.addEventListener('click', function () {
          s.index += 1;
          s.answered = false;
          renderChoiceStep();
        });
        nextWrap.appendChild(nextBtn);
        feedbackBox.appendChild(nextWrap);
        renderQuizStats();
        nextBtn.focus();
      });
      optionsGrid.appendChild(btn);
    });

    stageContent.appendChild(optionsGrid);
    stageContent.appendChild(feedbackBox);
  }

  function initQuizTab() {
    renderQuizStats();
    const form = document.getElementById('quiz-config-form');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const mode = document.getElementById('quiz-mode-select').value;
      const scope = document.getElementById('quiz-scope-select').value;
      startQuizSession(mode, scope);
    });
  }

  // ==========================================
  // 5. 나의 학습장 탭
  // ==========================================
  function renderHistorySection(tabController) {
    const records = storage.getRecords();
    const statsBar = document.getElementById('history-stats-bar');
    const listContainer = document.getElementById('history-list');

    clearEl(statsBar);
    const summary = storage.getProgressSummary();
    const completedCount = records.filter(function (r) { return r.completed; }).length;

    [
      { label: '강독 완료 괘', value: completedCount + '괘' },
      { label: '학습 목록 괘', value: records.length + '괘' },
      { label: '학습한 한자', value: summary.studiedCount + '자' },
      { label: '익힘 완료 한자', value: summary.masteredCount + '자' }
    ].forEach(function (t) {
      const tile = el('div', 'stat-tile');
      tile.appendChild(el('span', 'stat-label', t.label));
      tile.appendChild(el('span', 'stat-value', t.value));
      statsBar.appendChild(tile);
    });

    const query = document.getElementById('history-search-input').value.trim().toLowerCase();
    const monthFilter = document.getElementById('history-month-input').value;

    const filtered = records.filter(function (rec) {
      if (monthFilter && (rec.date || '').indexOf(monthFilter) !== 0) return false;
      if (!query) return true;
      const hexNum = rec.hexNum || rec.baseNum || 1;
      const hex = HEXAGRAM_BY_NUM[hexNum];
      const searchable = [
        String(hexNum),
        hex ? hex.name + ' ' + hex.hanjaName + ' ' + (hex.keywords || []).join(' ') + ' ' + (hex.summary || '') : ''
      ].join(' ').toLowerCase();
      return searchable.indexOf(query) !== -1;
    });

    clearEl(listContainer);
    if (filtered.length === 0) {
      listContainer.appendChild(el('p', 'muted-text', records.length === 0 ? '아직 저장된 강독 이력이 없습니다. 오늘의 강독 탭에서 괘를 확인하고 완료를 체크해 보세요.' : '검색 조건에 맞는 기록이 없습니다.'));
      return;
    }

    filtered.forEach(function (rec) {
      const hexNum = rec.hexNum || rec.baseNum || 1;
      const hex = HEXAGRAM_BY_NUM[hexNum];
      const card = el('article', 'history-item-card');

      const header = el('div', 'history-item-header');
      const left = el('div');
      left.appendChild(el('span', 'tag', formatKoreanDate(rec.date)));

      if (rec.completed) {
        const compLabel = el('span', 'tag tag-subtle', '강독 완료');
        compLabel.style.marginInlineStart = '0.4rem';
        left.appendChild(compLabel);
      }

      const titleStr = hex ? hex.num + '괘 ' + hex.name + ' (' + hex.hanjaName + ')' : '주역 강독';
      left.appendChild(el('h3', 'history-item-title', titleStr));
      header.appendChild(left);
      card.appendChild(header);

      if (hex && hex.summary) {
        card.appendChild(el('p', 'history-summary-text', hex.summary));
      }

      const actions = el('div', 'history-item-actions');
      const openBtn = el('button', 'btn btn-secondary btn-small', '강독 화면에서 열기');
      openBtn.type = 'button';
      openBtn.addEventListener('click', function () {
        loadHexagramStudy(hexNum, tabController);
        if (tabController) {
          tabController.activateTab(document.getElementById('tab-today'), true);
        }
      });
      actions.appendChild(openBtn);

      const isConfirming = appState.pendingDeleteId === rec.id;
      const delBtn = el('button', isConfirming ? 'btn btn-danger-outline btn-small' : 'btn btn-ghost btn-small', isConfirming ? '삭제 확인 (다시 누르면 삭제)' : '삭제');
      delBtn.type = 'button';
      delBtn.addEventListener('click', function () {
        if (appState.pendingDeleteId !== rec.id) {
          appState.pendingDeleteId = rec.id;
          renderHistorySection(tabController);
          return;
        }
        storage.deleteRecord(rec.id);
        appState.pendingDeleteId = null;
        renderHistorySection(tabController);
        announce('선택한 학습 기록이 삭제되었습니다.');
      });
      actions.appendChild(delBtn);

      if (isConfirming) {
        const cancelBtn = el('button', 'btn btn-ghost btn-small', '취소');
        cancelBtn.type = 'button';
        cancelBtn.addEventListener('click', function () {
          appState.pendingDeleteId = null;
          renderHistorySection(tabController);
        });
        actions.appendChild(cancelBtn);
      }

      card.appendChild(actions);
      listContainer.appendChild(card);
    });
  }

  function initHistoryTab(tabController) {
    const searchInput = document.getElementById('history-search-input');
    const monthInput = document.getElementById('history-month-input');
    const filterForm = document.getElementById('history-filter-form');

    filterForm.addEventListener('submit', function (e) { e.preventDefault(); });
    searchInput.addEventListener('input', function () { renderHistorySection(tabController); });
    monthInput.addEventListener('change', function () { renderHistorySection(tabController); });

    document.getElementById('btn-export-backup').addEventListener('click', function () {
      const jsonStr = storage.exportBackupJson();
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'iching-study-backup-' + iching.getLocalDateString(new Date()) + '.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      announce('학습 기록 백업 파일을 다운로드했습니다.');
    });

    document.getElementById('import-backup-input').addEventListener('change', function (e) {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function () {
        try {
          const total = storage.importBackupJson(String(reader.result || ''));
          renderHistorySection(tabController);
          renderQuizStats();
          announce('백업을 불러왔습니다. 총 ' + total + '건의 기록이 보관되어 있습니다.');
        } catch (err) {
          announce('백업 파일을 읽을 수 없습니다. 올바른 JSON 백업 파일인지 확인해 주세요.');
        }
        e.target.value = '';
      };
      reader.readAsText(file, 'utf-8');
    });
  }

  // ==========================================
  // 6. 64괘 강독 도감 탭
  // ==========================================
  function renderEncyclopediaGrid(tabController) {
    const query = document.getElementById('hex-search-input').value.trim().toLowerCase();
    const upperFilter = document.getElementById('hex-upper-select').value;
    const lowerFilter = document.getElementById('hex-lower-select').value;
    const grid = document.getElementById('hex-grid');
    const countInfo = document.getElementById('hex-count-info');

    clearEl(grid);
    const filtered = HEXAGRAMS.filter(function (hex) {
      if (upperFilter !== 'all' && hex.upper !== upperFilter) return false;
      if (lowerFilter !== 'all' && hex.lower !== lowerFilter) return false;
      if (!query) return true;
      const searchable = [
        String(hex.num),
        hex.name,
        hex.hanjaName,
        hex.summary,
        hex.guaOriginal || '',
        hex.daXiangOriginal || '',
        (hex.keywords || []).join(' ')
      ].join(' ').toLowerCase();
      return searchable.indexOf(query) !== -1;
    });

    countInfo.textContent = '총 ' + filtered.length + '개의 괘가 표시되었습니다.';
    filtered.forEach(function (hex) {
      const btn = el('button', 'hex-card-btn');
      btn.type = 'button';
      btn.setAttribute('aria-haspopup', 'dialog');

      const header = el('div', 'hex-card-header');
      header.appendChild(el('span', 'tag', hex.num + '괘'));
      header.appendChild(el('span', 'hex-hanja-name', hex.hanjaName));
      btn.appendChild(header);

      btn.appendChild(renderMiniHexVisual(hex.linesBinary));
      btn.appendChild(el('h3', 'hex-card-title', hex.name));
      btn.appendChild(el('p', 'hex-card-trigrams', hex.upperTrigram.nature + ' · ' + hex.lowerTrigram.nature));
      btn.appendChild(el('p', 'hex-card-summary', hex.summary));

      const kwRow = el('div', 'keyword-row');
      (hex.keywords || []).slice(0, 3).forEach(function (kw) {
        kwRow.appendChild(el('span', 'keyword-pill', kw));
      });
      btn.appendChild(kwRow);

      btn.addEventListener('click', function () {
        openHexDetailDialog(hex, tabController);
      });
      grid.appendChild(btn);
    });
  }

  function openHexDetailDialog(hex, tabController) {
    const dialog = document.getElementById('hex-detail-dialog');
    const numTag = document.getElementById('dialog-hex-num');
    const title = document.getElementById('dialog-hex-title');
    const content = document.getElementById('dialog-hex-content');

    numTag.textContent = hex.num + '번째 괘 · 상괘 ' + hex.upperTrigram.name + '(' + hex.upperTrigram.nature + ') / 하괘 ' + hex.lowerTrigram.name + '(' + hex.lowerTrigram.nature + ')';
    title.textContent = hex.name + ' (' + hex.hanjaName + ')';
    clearEl(content);

    // 바로 강독하기 액션 버튼
    const topActionWrap = el('div', 'quiz-actions-center');
    topActionWrap.style.marginBlockEnd = '1rem';
    const studyNowBtn = el('button', 'btn btn-primary', '오늘의 강독으로 열기');
    studyNowBtn.type = 'button';
    studyNowBtn.addEventListener('click', function () {
      dialog.close();
      loadHexagramStudy(hex.num, tabController);
      if (tabController) {
        tabController.activateTab(document.getElementById('tab-today'), true);
      }
    });
    topActionWrap.appendChild(studyNowBtn);
    content.appendChild(topActionWrap);

    // 괘 형상
    const visualWrap = el('div', 'hex-box');
    const linesWrap = el('div', 'hex-lines-visual');
    renderHexVisual(linesWrap, hex.linesBinary);
    visualWrap.appendChild(linesWrap);
    const kwRow = el('div', 'keyword-row');
    (hex.keywords || []).forEach(function (kw) {
      kwRow.appendChild(el('span', 'keyword-pill', kw));
    });
    visualWrap.appendChild(kwRow);
    content.appendChild(visualWrap);

    content.appendChild(el('p', 'lead-text', hex.summary));

    // 괘사
    const guaBox = el('div', 'classic-quote-box');
    guaBox.appendChild(el('span', 'classic-badge', '괘사 (卦辭)'));
    const guaOrig = el('p', 'classic-original', hex.guaOriginal);
    guaOrig.setAttribute('lang', 'zh-Hant');
    guaBox.appendChild(guaOrig);
    guaBox.appendChild(el('p', 'classic-reading', '음독: ' + hex.guaReading));
    guaBox.appendChild(el('div', 'classic-divider'));
    guaBox.appendChild(el('p', 'classic-meaning', hex.guaMeaning));
    content.appendChild(guaBox);

    // 대상전
    const daXiangBox = el('div', 'classic-quote-box daxiang-quote-box');
    daXiangBox.appendChild(el('span', 'classic-badge classic-badge-daxiang', '대상전 (大象傳)'));
    const dxOrig = el('p', 'classic-original', hex.daXiangOriginal);
    dxOrig.setAttribute('lang', 'zh-Hant');
    daXiangBox.appendChild(dxOrig);
    daXiangBox.appendChild(el('p', 'classic-reading', '음독: ' + hex.daXiangReading));
    daXiangBox.appendChild(el('div', 'classic-divider'));
    daXiangBox.appendChild(el('p', 'classic-meaning', hex.daXiangMeaning));
    content.appendChild(daXiangBox);

    // 본문 속 한자
    if (hex.hanja && hex.hanja.length > 0) {
      content.appendChild(el('h3', 'classics-hanja-heading', '이 괘의 고전 한자'));
      const hanjaGrid = el('div', 'hanja-chip-grid');
      hex.hanja.forEach(function (ch) {
        const entry = HANJA_DICT[ch];
        if (!entry) return;
        const card = el('div', 'hanja-mini-card');
        const glyph = el('span', 'hanja-glyph-lg', entry.char);
        glyph.setAttribute('lang', 'zh-Hant');
        card.appendChild(glyph);
        card.appendChild(el('span', 'hanja-reading', entry.meaning + ' ' + entry.sound));
        card.appendChild(el('span', 'hanja-sub-meta', entry.radical));
        hanjaGrid.appendChild(card);
      });
      content.appendChild(hanjaGrid);
    }

    // 6효 전체
    content.appendChild(el('h3', '', '6효(爻辭) 해설'));
    const linesWrapList = el('div', 'all-lines-list');
    (hex.lines || []).forEach(function (lineData) {
      const row = el('div', 'line-item-row');
      row.appendChild(el('strong', '', lineData.title));
      row.appendChild(el('p', '', lineData.meaning));
      row.appendChild(el('p', 'muted-text', '처신: ' + lineData.action));
      linesWrapList.appendChild(row);
    });
    content.appendChild(linesWrapList);

    dialog.showModal();
  }

  function initEncyclopediaTab(tabController) {
    const upperSelect = document.getElementById('hex-upper-select');
    const lowerSelect = document.getElementById('hex-lower-select');
    const searchInput = document.getElementById('hex-search-input');
    const filterForm = document.getElementById('hex-filter-form');
    const dialog = document.getElementById('hex-detail-dialog');
    const closeBtn = document.getElementById('btn-close-dialog');

    TRIGRAM_ORDER.forEach(function (id) {
      const tri = TRIGRAMS[id];
      const text = tri.name + '(' + tri.nature + ', ' + tri.hanja + ')';
      const opt1 = el('option', '', text);
      opt1.value = id;
      upperSelect.appendChild(opt1);

      const opt2 = el('option', '', text);
      opt2.value = id;
      lowerSelect.appendChild(opt2);
    });

    filterForm.addEventListener('submit', function (e) { e.preventDefault(); });
    searchInput.addEventListener('input', function () { renderEncyclopediaGrid(tabController); });
    upperSelect.addEventListener('change', function () { renderEncyclopediaGrid(tabController); });
    lowerSelect.addEventListener('change', function () { renderEncyclopediaGrid(tabController); });

    closeBtn.addEventListener('click', function () {
      dialog.close();
    });

    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) {
        dialog.close();
      }
    });

    renderEncyclopediaGrid(tabController);
  }

  // ==========================================
  // 7. 초기화 (Bootstrap)
  // ==========================================
  function bootstrap() {
    const todayStr = iching.getLocalDateString(new Date());
    document.getElementById('today-date-label').textContent = formatKoreanDate(todayStr);

    const tabController = initTabs();
    initTodayTab(tabController);
    initHanjaTab();
    initQuizTab();
    initHistoryTab(tabController);
    initEncyclopediaTab(tabController);

    // 오늘 날짜로 이미 저장된 강독이 있으면 해당 괘 복원, 없으면 오늘 날짜 순환 추천 괘 로드
    const existingToday = storage.getLatestRecordForDate(todayStr);
    if (existingToday) {
      const hydrated = iching.hydrateReading(existingToday);
      appState.currentReading = hydrated;
      appState.currentHexNum = hydrated.hexNum || hydrated.baseNum || 1;
      storage.markHanjaStudied(hydrated.hexagram.hanja);
      renderReading(hydrated);
      renderTodayHanjaSection();
    } else {
      const todayHexNum = iching.getDailyHexagramNum(new Date());
      loadHexagramStudy(todayHexNum, tabController);
    }
  }

  document.addEventListener('DOMContentLoaded', bootstrap);
})(window);
