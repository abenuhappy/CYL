// 일일 주역 웹 애플리케이션 메인 컨트롤러
(function (global) {
  'use strict';

  const ns = global.DailyIChing || {};
  const TRIGRAMS = ns.TRIGRAMS || {};
  const TRIGRAM_ORDER = ns.TRIGRAM_ORDER || [];
  const HANJA_DICT = ns.HANJA_DICT || {};
  const HEXAGRAMS = ns.HEXAGRAMS || [];
  const HEXAGRAM_BY_NUM = ns.HEXAGRAM_BY_NUM || {};
  const HEXAGRAM_CLASSICS = ns.HEXAGRAM_CLASSICS || {};
  const iching = ns.iching;
  const storage = ns.storage;
  const quiz = ns.quiz;

  const LINE_NAMES = ['1효 (초효)', '2효 (이효)', '3효 (삼효)', '4효 (사효)', '5효 (오효)', '6효 (상효)'];
  const TAB_TITLES = {
    'tab-today': '오늘의 괘 | 일일 주역',
    'tab-hanja': '한자 공부 | 일일 주역',
    'tab-quiz': '복습 퀴즈 | 일일 주역',
    'tab-history': '나의 기록 | 일일 주역',
    'tab-encyclopedia': '64괘 도감 | 일일 주역',
    'tab-help': '도움말 | 일일 주역'
  };

  // 현재 앱 상태
  const appState = {
    currentReading: null,
    coinThrows: [],
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

  // 오늘의 괘와 연관된 한자 목록 추출 (중복 제거)
  function getReadingHanjaChars(reading) {
    if (!reading || !reading.baseHexagram) return [];
    const seen = {};
    const list = [];

    function pushChars(arr) {
      (arr || []).forEach(function (ch) {
        if (HANJA_DICT[ch] && !seen[ch]) {
          seen[ch] = true;
          list.push(ch);
        }
      });
    }

    pushChars(reading.baseHexagram.hanja);
    const baseClassics = HEXAGRAM_CLASSICS[reading.baseHexagram.num];
    if (baseClassics) {
      pushChars(baseClassics.classicHanja);
    }
    if (reading.targetHexagram) {
      pushChars(reading.targetHexagram.hanja);
      const targetClassics = HEXAGRAM_CLASSICS[reading.targetHexagram.num];
      if (targetClassics) {
        pushChars(targetClassics.classicHanja);
      }
    }
    return list;
  }

  function appendClassicPassage(parent, label, original, reading, meaning) {
    const box = el('div', 'gua-quote-box');
    box.appendChild(el('span', 'quote-label', label));
    const orig = el('p', 'classic-original', original);
    orig.setAttribute('lang', 'zh-Hant');
    box.appendChild(orig);
    box.appendChild(el('p', 'muted-text classic-reading', '음독: ' + reading));
    box.appendChild(el('p', 'quote-text classic-meaning', meaning));
    parent.appendChild(box);
  }

  function appendClassicHanjaChips(parent, chars) {
    const heading = el('h3', 'classics-hanja-heading', '이 괘의 괘사·대상전 핵심 한자');
    parent.appendChild(heading);
    const grid = el('div', 'hanja-chip-grid');
    (chars || []).forEach(function (ch) {
      const entry = HANJA_DICT[ch];
      if (!entry) return;
      const card = el('div', 'hanja-mini-card');
      const glyph = el('span', 'hanja-glyph-lg', entry.char);
      glyph.setAttribute('lang', 'zh-Hant');
      card.appendChild(glyph);
      card.appendChild(el('span', 'hanja-reading', entry.meaning + ' ' + entry.sound));
      card.appendChild(el('span', 'hanja-sub-meta', entry.radical));
      grid.appendChild(card);
    });
    parent.appendChild(grid);
  }

  function appendHexClassicsContent(parent, hexNum, options) {
    const classic = HEXAGRAM_CLASSICS[hexNum];
    if (!parent || !classic) return false;
    const rolePrefix = options && options.roleLabel ? options.roleLabel + ' ' : '';
    appendClassicPassage(
      parent,
      rolePrefix + '괘사(卦辭)',
      classic.guaOriginal,
      classic.guaReading,
      classic.guaMeaning
    );
    appendClassicPassage(
      parent,
      rolePrefix + '대상전(大象傳)',
      classic.daXiangOriginal,
      classic.daXiangReading,
      classic.daXiangMeaning
    );
    if (!options || options.showHanja !== false) {
      appendClassicHanjaChips(parent, classic.classicHanja);
    }
    return true;
  }

  function collectClassicHanjaForNums(nums) {
    const seen = {};
    const list = [];
    (nums || []).forEach(function (num) {
      const classic = HEXAGRAM_CLASSICS[num];
      if (!classic) return;
      (classic.classicHanja || []).forEach(function (ch) {
        if (!seen[ch] && HANJA_DICT[ch]) {
          seen[ch] = true;
          list.push(ch);
        }
      });
    });
    return list;
  }

  // 6효 시각화 막대 렌더링 (1=양효, 0=음효)
  function renderHexVisual(container, linesBinary, changingIndices) {
    clearEl(container);
    const movingSet = new Set(changingIndices || []);
    (linesBinary || []).forEach(function (bit, idx) {
      const bar = el('div', 'hex-line-bar ' + (bit === 1 ? 'yang' : 'yin') + (movingSet.has(idx) ? ' is-changing' : ''));
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

      document.title = TAB_TITLES[targetTab.id] || '일일 주역';
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

    // 브라우저 페이지 내 찾기(Ctrl/Cmd+F)로 숨김 패널 검색 시 자동 전환
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
  // 2. 오늘의 괘 작괘 및 풀이 렌더링
  // ==========================================
  function renderReading(reading) {
    const emptyCard = document.getElementById('today-empty-state');
    const resultArea = document.getElementById('today-result-area');

    if (!reading || !reading.baseHexagram) {
      emptyCard.hidden = false;
      resultArea.hidden = true;
      return;
    }

    emptyCard.hidden = true;
    resultArea.hidden = false;

    const base = reading.baseHexagram;
    const target = reading.targetHexagram;
    const moving = reading.changingIndices || [];

    document.getElementById('reading-date-tag').textContent = formatKoreanDate(reading.date);
    document.getElementById('reading-method-tag').textContent =
      reading.method === 'coins' ? '동전 6회 작괘' : '바로 뽑기';

    const questionEl = document.getElementById('reading-question-display');
    if (reading.question) {
      questionEl.textContent = '질문: ' + reading.question;
      questionEl.hidden = false;
    } else {
      questionEl.hidden = true;
    }

    // 본괘 카드
    renderHexVisual(document.getElementById('base-hex-visual'), base.linesBinary, moving);
    document.getElementById('base-hex-title').textContent =
      base.num + '괘 ' + base.name + ' (' + base.hanjaName + ')';
    document.getElementById('base-hex-trigrams').textContent =
      '상괘 ' + base.upperTrigram.name + '(' + base.upperTrigram.nature + ') · 하괘 ' +
      base.lowerTrigram.name + '(' + base.lowerTrigram.nature + ')';

    const baseKeywords = document.getElementById('base-hex-keywords');
    clearEl(baseKeywords);
    base.keywords.forEach(function (kw) {
      baseKeywords.appendChild(el('span', 'keyword-pill', kw));
    });

    // 변화 요약 및 지괘 카드
    const targetBox = document.getElementById('target-hex-box');
    const changingBadge = document.getElementById('changing-summary-badge');
    const ruleDesc = document.getElementById('changing-rule-desc');

    changingBadge.textContent = reading.focus.ruleTitle;
    ruleDesc.textContent = reading.focus.ruleDesc;

    if (target) {
      targetBox.classList.remove('is-static-target');
      renderHexVisual(document.getElementById('target-hex-visual'), target.linesBinary, moving);
      document.getElementById('target-hex-title').textContent =
        target.num + '괘 ' + target.name + ' (' + target.hanjaName + ')';
      document.getElementById('target-hex-trigrams').textContent =
        '상괘 ' + target.upperTrigram.name + '(' + target.upperTrigram.nature + ') · 하괘 ' +
        target.lowerTrigram.name + '(' + target.lowerTrigram.nature + ')';
      const targetKeywords = document.getElementById('target-hex-keywords');
      clearEl(targetKeywords);
      target.keywords.forEach(function (kw) {
        targetKeywords.appendChild(el('span', 'keyword-pill', kw));
      });
    } else {
      targetBox.classList.add('is-static-target');
      renderHexVisual(document.getElementById('target-hex-visual'), base.linesBinary, []);
      document.getElementById('target-hex-title').textContent = '변화 없음 (본괘 유지)';
      document.getElementById('target-hex-trigrams').textContent = '변효가 없어 본괘의 기운이 그대로 이어집니다.';
      clearEl(document.getElementById('target-hex-keywords'));
    }

    // 괘 의미 및 괘사
    document.getElementById('hex-summary-text').textContent = base.summary;
    document.getElementById('hex-guatext').textContent = base.guaText;

    const classicsBlock = document.getElementById('hex-classics-block');
    clearEl(classicsBlock);
    if (!HEXAGRAM_CLASSICS[base.num]) {
      classicsBlock.hidden = true;
    } else {
      classicsBlock.hidden = false;
      appendHexClassicsContent(classicsBlock, base.num, { showHanja: false });
      if (target && target.num !== base.num && HEXAGRAM_CLASSICS[target.num]) {
        classicsBlock.appendChild(el('h3', 'classics-hanja-heading', '지괘 괘사·대상전'));
        appendHexClassicsContent(classicsBlock, target.num, { roleLabel: '지괘', showHanja: false });
      }
      const classicNums = [base.num];
      if (target && target.num !== base.num) {
        classicNums.push(target.num);
      }
      const classicChars = collectClassicHanjaForNums(classicNums);
      if (classicChars.length > 0) {
        classicsBlock.appendChild(el('h3', 'classics-hanja-heading', '오늘 괘의 괘사·대상전 핵심 한자'));
        appendClassicHanjaChips(classicsBlock, classicChars);
      }
    }

    // 변효 말씀 영역
    const changingSection = document.getElementById('changing-lines-section');
    const changingList = document.getElementById('changing-lines-list');
    clearEl(changingList);

    if (moving.length > 0) {
      changingSection.hidden = false;
      moving.forEach(function (idx) {
        const lineData = base.lines[idx];
        const isFocus = reading.focus.primaryLineIndex === idx;
        const card = el('article', 'line-advice-card' + (isFocus ? ' is-primary-focus' : ''));
        const headingText = lineData.title + (isFocus ? ' — 오늘의 핵심 지침' : ' — 변효 참고');
        card.appendChild(el('h4', 'line-advice-title', headingText));
        card.appendChild(el('p', 'line-advice-meaning', lineData.meaning));
        card.appendChild(el('p', 'line-advice-action', '오늘의 행동: ' + lineData.action));
        changingList.appendChild(card);
      });
    } else {
      changingSection.hidden = true;
    }

    // 전체 6효 목록
    const allLinesList = document.getElementById('all-lines-list');
    clearEl(allLinesList);
    const movingSet = new Set(moving);
    base.lines.forEach(function (lineData, idx) {
      const row = el('div', 'line-item-row' + (movingSet.has(idx) ? ' is-moving' : ''));
      row.appendChild(el('strong', '', lineData.title + (movingSet.has(idx) ? ' (변효)' : '')));
      row.appendChild(el('p', '', lineData.meaning));
      row.appendChild(el('p', 'muted-text', '대응: ' + lineData.action));
      allLinesList.appendChild(row);
    });

    // 실생활 대응 4카드
    document.getElementById('advice-attitude').textContent = base.advice.attitude;
    document.getElementById('advice-work').textContent = base.advice.work;
    document.getElementById('advice-relationship').textContent = base.advice.relationship;
    document.getElementById('advice-caution').textContent = base.advice.caution;

    // 오늘의 한자 미리보기
    renderTodayHanjaPreview(reading);

    // 메모/회고 입력값 채우기
    document.getElementById('memo-input').value = reading.memo || '';
    document.getElementById('reflection-input').value = reading.reflection || '';
    document.getElementById('journal-save-feedback').textContent = '';
  }

  function renderTodayHanjaPreview(reading) {
    const container = document.getElementById('today-hanja-preview');
    clearEl(container);
    const chars = getReadingHanjaChars(reading);

    chars.forEach(function (ch) {
      const entry = HANJA_DICT[ch];
      const card = el('div', 'hanja-mini-card');
      const glyph = el('span', 'hanja-glyph-lg', entry.char);
      glyph.setAttribute('lang', 'zh-Hant');
      card.appendChild(glyph);
      card.appendChild(el('span', 'hanja-reading', entry.meaning + ' ' + entry.sound));
      card.appendChild(el('span', 'hanja-sub-meta', entry.radical + ' · ' + entry.strokes + '획'));
      container.appendChild(card);
    });
  }

  // 작괘 완료 공통 처리
  function applyNewThrows(throws, method) {
    const questionInput = document.getElementById('question-input');
    const rawReading = iching.buildReading(throws, {
      question: questionInput.value,
      method: method
    });
    storage.saveReadingRecord(rawReading);
    const hydrated = iching.hydrateReading(rawReading);
    appState.currentReading = hydrated;

    // 오늘 뽑은 괘의 한자를 자동 학습 기록에 반영
    const chars = getReadingHanjaChars(hydrated);
    storage.markHanjaStudied(chars);

    renderReading(hydrated);
    announce(hydrated.baseHexagram.name + ' 괘가 도출되어 저장되었습니다.');
  }

  function updateCoinPreviewUI() {
    const step = appState.coinThrows.length;
    const stepLabel = document.getElementById('coin-step-label');
    const progressText = document.getElementById('coin-progress-text');
    const previewContainer = document.getElementById('coin-preview-lines');
    const tossBtn = document.getElementById('btn-toss-coin');

    progressText.textContent = step + ' / 6 효 완료';
    if (step < 6) {
      stepLabel.textContent = LINE_NAMES[step] + ' 던지기';
      tossBtn.disabled = false;
      tossBtn.textContent = (step + 1) + '효 동전 던지기';
    } else {
      stepLabel.textContent = '6효 모두 완성되었습니다';
      tossBtn.disabled = true;
    }

    clearEl(previewContainer);
    appState.coinThrows.forEach(function (t, idx) {
      const row = el('div', 'preview-line-row');
      row.appendChild(el('span', 'preview-line-label', (idx + 1) + '효'));
      const mini = el('div', 'hex-mini-lines');
      mini.appendChild(el('div', 'hex-mini-bar ' + (t.isYang ? 'yang' : 'yin')));
      row.appendChild(mini);
      row.appendChild(el('span', '', t.value + ' (' + t.label + ')'));
      previewContainer.appendChild(row);
    });
  }

  function initTodayTab(tabController) {
    const quickBtn = document.getElementById('btn-quick-cast');
    const coinModeBtn = document.getElementById('btn-coin-mode');
    const coinArea = document.getElementById('coin-cast-area');
    const tossBtn = document.getElementById('btn-toss-coin');
    const resetCoinBtn = document.getElementById('btn-reset-coin');
    const recastBtn = document.getElementById('btn-recast-today');
    const journalForm = document.getElementById('journal-form');
    const goHanjaBtn = document.getElementById('btn-go-hanja-tab');
    const goQuizBtn = document.getElementById('btn-go-quiz-today');

    quickBtn.addEventListener('click', function () {
      coinArea.hidden = true;
      const throws = iching.castSixLines();
      applyNewThrows(throws, 'quick');
      document.getElementById('today-result-area').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    coinModeBtn.addEventListener('click', function () {
      appState.coinThrows = [];
      const discs = document.querySelectorAll('#coin-visual-row .coin-disc');
      discs.forEach(function (d) {
        d.textContent = '?';
        d.classList.remove('is-yang');
      });
      coinArea.hidden = false;
      updateCoinPreviewUI();
      tossBtn.focus();
    });

    tossBtn.addEventListener('click', function () {
      if (appState.coinThrows.length >= 6) return;
      const result = iching.tossThreeCoins();
      appState.coinThrows.push(result);

      const discs = document.querySelectorAll('#coin-visual-row .coin-disc');
      result.coins.forEach(function (val, idx) {
        if (!discs[idx]) return;
        discs[idx].textContent = val === 3 ? '앞(3)' : '뒤(2)';
        discs[idx].classList.toggle('is-yang', val === 3);
      });

      updateCoinPreviewUI();
      announce(appState.coinThrows.length + '효 ' + result.label + '이 나왔습니다.');

      if (appState.coinThrows.length === 6) {
        const finalThrows = appState.coinThrows.slice();
        applyNewThrows(finalThrows, 'coins');
        global.setTimeout(function () {
          coinArea.hidden = true;
        }, 450);
      }
    });

    resetCoinBtn.addEventListener('click', function () {
      appState.coinThrows = [];
      const discs = document.querySelectorAll('#coin-visual-row .coin-disc');
      discs.forEach(function (d) {
        d.textContent = '?';
        d.classList.remove('is-yang');
      });
      updateCoinPreviewUI();
    });

    recastBtn.addEventListener('click', function () {
      document.getElementById('cast-heading').scrollIntoView({ behavior: 'smooth', block: 'start' });
      quickBtn.focus();
    });

    journalForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!appState.currentReading) return;
      const memo = document.getElementById('memo-input').value.trim();
      const reflection = document.getElementById('reflection-input').value.trim();
      const updated = storage.updateRecordNotes(appState.currentReading.id, memo, reflection);
      if (updated) {
        appState.currentReading.memo = updated.memo;
        appState.currentReading.reflection = updated.reflection;
        const feedback = document.getElementById('journal-save-feedback');
        feedback.textContent = '메모와 회고가 저장되었습니다.';
        announce('오늘의 대응 메모와 회고가 저장되었습니다.');
      }
    });

    goHanjaBtn.addEventListener('click', function () {
      tabController.activateTab(document.getElementById('tab-hanja'), true);
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

    document.getElementById('btn-mark-today-studied').addEventListener('click', function () {
      const chars = getReadingHanjaChars(appState.currentReading);
      if (chars.length === 0) {
        announce('먼저 오늘의 괘를 뽑아주세요.');
        return;
      }
      storage.markHanjaStudied(chars);
      renderQuizStats();
      announce('오늘의 괘 한자 ' + chars.length + '자를 복습장에 기록했습니다.');
    });
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
      stageContent.appendChild(el('p', 'muted-text', '선택한 범위에 출제할 한자가 없습니다. 오답이 없다면 전체 또는 오늘의 괘 범위를 선택해 주세요.'));
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
    header.appendChild(el('span', '', '문제 ' + (s.index + 1) + ' / ' + s.questions.length));
    header.appendChild(el('span', '', '현재 정답: ' + s.correctCount + '개'));
    stageContent.appendChild(header);

    const glyph = el('div', 'quiz-prompt-char', q.char);
    glyph.setAttribute('lang', 'zh-Hant');
    stageContent.appendChild(glyph);
    stageContent.appendChild(el('p', 'quiz-hint-text', '위 한자의 올바른 뜻과 음을 고르세요. (부수: ' + q.entry.radical + ')'));

    const optionsGrid = el('div', 'quiz-options-grid');
    const feedbackBox = el('div', 'quiz-feedback-box');
    feedbackBox.hidden = true;

    q.options.forEach(function (opt) {
      const btn = el('button', 'quiz-option-btn', opt.label);
      btn.type = 'button';
      btn.addEventListener('click', function () {
        if (s.answered) return;
        s.answered = true;
        storage.recordHanjaReview(q.char, opt.isCorrect);
        if (opt.isCorrect) s.correctCount += 1;

        Array.from(optionsGrid.children).forEach(function (child, idx) {
          child.disabled = true;
          const item = q.options[idx];
          if (item.isCorrect) {
            child.classList.add('is-correct');
          } else if (child === btn && !item.isCorrect) {
            child.classList.add('is-wrong');
          }
        });

        clearEl(feedbackBox);
        feedbackBox.hidden = false;
        feedbackBox.appendChild(el('strong', '', opt.isCorrect ? '정답입니다.' : '아쉽습니다. 정답은 "' + q.entry.meaning + ' ' + q.entry.sound + '"입니다.'));
        feedbackBox.appendChild(el('p', '', q.entry.note));
        if (q.entry.words && q.entry.words.length > 0) {
          feedbackBox.appendChild(el('p', 'hanja-words', '관련 어휘: ' + q.entry.words.join(', ')));
        }

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
  // 5. 나의 기록 탭
  // ==========================================
  function renderHistorySection(tabController) {
    const records = storage.getRecords();
    const statsBar = document.getElementById('history-stats-bar');
    const listContainer = document.getElementById('history-list');

    clearEl(statsBar);
    const todayStr = iching.getLocalDateString(new Date());
    const currentMonth = todayStr.slice(0, 7);
    const monthCount = records.filter(function (r) { return (r.date || '').indexOf(currentMonth) === 0; }).length;
    const reflectionCount = records.filter(function (r) { return Boolean(r.reflection && r.reflection.trim()); }).length;

    [
      { label: '전체 기록', value: records.length + '건' },
      { label: '이번 달 기록', value: monthCount + '건' },
      { label: '저녁 회고 작성', value: reflectionCount + '건' }
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
      const base = HEXAGRAM_BY_NUM[rec.baseNum];
      const target = rec.targetNum ? HEXAGRAM_BY_NUM[rec.targetNum] : null;
      const searchable = [
        rec.question || '',
        rec.memo || '',
        rec.reflection || '',
        base ? base.name + ' ' + base.hanjaName : '',
        target ? target.name + ' ' + target.hanjaName : ''
      ].join(' ').toLowerCase();
      return searchable.indexOf(query) !== -1;
    });

    clearEl(listContainer);
    if (filtered.length === 0) {
      listContainer.appendChild(el('p', 'muted-text', records.length === 0 ? '아직 저장된 주역 기록이 없습니다. 오늘의 괘 탭에서 첫 기록을 남겨보세요.' : '검색 조건에 맞는 기록이 없습니다.'));
      return;
    }

    filtered.forEach(function (rec) {
      const base = HEXAGRAM_BY_NUM[rec.baseNum];
      const target = rec.targetNum ? HEXAGRAM_BY_NUM[rec.targetNum] : null;
      const card = el('article', 'history-item-card');

      const header = el('div', 'history-item-header');
      const left = el('div');
      left.appendChild(el('span', 'tag', formatKoreanDate(rec.date)));
      if (rec.changingPositions && rec.changingPositions.length > 0) {
        const posLabel = el('span', 'tag tag-subtle', '변효 ' + rec.changingPositions.join(', ') + '효');
        posLabel.style.marginInlineStart = '0.4rem';
        left.appendChild(posLabel);
      }

      const titleStr = (base ? base.name + '(' + base.hanjaName + ')' : '') +
        (target ? ' → ' + target.name + '(' + target.hanjaName + ')' : ' (변화 없음)');
      left.appendChild(el('h3', 'history-item-title', titleStr));
      header.appendChild(left);
      card.appendChild(header);

      const notes = el('div', 'history-notes');
      if (rec.question) {
        notes.appendChild(el('div', '', '질문: ' + rec.question));
      }
      if (rec.memo) {
        notes.appendChild(el('div', 'history-note-box', '대응 다짐: ' + rec.memo));
      }
      if (rec.reflection) {
        notes.appendChild(el('div', 'history-note-box', '저녁 회고: ' + rec.reflection));
      }
      if (notes.childNodes.length > 0) {
        card.appendChild(notes);
      }

      const actions = el('div', 'history-item-actions');
      const openBtn = el('button', 'btn btn-secondary btn-small', '오늘의 괘 화면에서 보기');
      openBtn.type = 'button';
      openBtn.addEventListener('click', function () {
        const hydrated = iching.hydrateReading(rec);
        appState.currentReading = hydrated;
        renderReading(hydrated);
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
        if (appState.currentReading && appState.currentReading.id === rec.id) {
          appState.currentReading = null;
          renderReading(null);
        }
        renderHistorySection(tabController);
        announce('선택한 기록이 삭제되었습니다.');
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
      a.download = 'daily-iching-backup-' + iching.getLocalDateString(new Date()) + '.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      announce('기록 백업 파일을 다운로드했습니다.');
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

    renderHistorySection(tabController);
  }

  // ==========================================
  // 6. 64괘 도감 및 상세 다이얼로그
  // ==========================================
  function openHexDetailDialog(hex) {
    const dialog = document.getElementById('hex-detail-dialog');
    const numTag = document.getElementById('dialog-hex-num');
    const title = document.getElementById('dialog-hex-title');
    const content = document.getElementById('dialog-hex-content');

    numTag.textContent = hex.num + '번째 괘 · 상괘 ' + hex.upperTrigram.name + '(' + hex.upperTrigram.nature + ') / 하괘 ' + hex.lowerTrigram.name + '(' + hex.lowerTrigram.nature + ')';
    title.textContent = hex.name + ' (' + hex.hanjaName + ')';
    clearEl(content);

    const visualWrap = el('div', 'hex-box');
    const linesWrap = el('div', 'hex-lines-visual');
    renderHexVisual(linesWrap, hex.linesBinary, []);
    visualWrap.appendChild(linesWrap);
    const kwRow = el('div', 'keyword-row');
    hex.keywords.forEach(function (kw) {
      kwRow.appendChild(el('span', 'keyword-pill', kw));
    });
    visualWrap.appendChild(kwRow);
    content.appendChild(visualWrap);

    content.appendChild(el('p', 'lead-text', hex.summary));
    const quoteBox = el('div', 'gua-quote-box');
    quoteBox.appendChild(el('span', 'quote-label', '괘사 핵심'));
    quoteBox.appendChild(el('p', 'quote-text', hex.guaText));
    content.appendChild(quoteBox);

    const classicsWrap = el('div', 'classics-block');
    if (appendHexClassicsContent(classicsWrap, hex.num)) {
      content.appendChild(classicsWrap);
    }

    const adviceGrid = el('div', 'advice-grid');
    [
      { label: '오늘의 태도', text: hex.advice.attitude, isCaution: false },
      { label: '업무와 결정', text: hex.advice.work, isCaution: false },
      { label: '대인관계', text: hex.advice.relationship, isCaution: false },
      { label: '주의할 점', text: hex.advice.caution, isCaution: true }
    ].forEach(function (item) {
      const box = el('div', 'advice-item' + (item.isCaution ? ' advice-caution' : ''));
      box.appendChild(el('h3', '', item.label));
      box.appendChild(el('p', '', item.text));
      adviceGrid.appendChild(box);
    });
    content.appendChild(adviceGrid);

    const linesHeading = el('h3', '', '6효 말씀');
    content.appendChild(linesHeading);
    const linesList = el('div', 'all-lines-list');
    hex.lines.forEach(function (l) {
      const row = el('div', 'line-item-row');
      row.appendChild(el('strong', '', l.title));
      row.appendChild(el('p', '', l.meaning));
      row.appendChild(el('p', 'muted-text', '대응: ' + l.action));
      linesList.appendChild(row);
    });
    content.appendChild(linesList);

    const hanjaHeading = el('h3', '', '이 괘의 괘명·팔괘 한자');
    content.appendChild(hanjaHeading);
    const hanjaGrid = el('div', 'hanja-chip-grid');
    (hex.hanja || []).forEach(function (ch) {
      const entry = HANJA_DICT[ch];
      if (!entry) return;
      const card = el('div', 'hanja-mini-card');
      const g = el('span', 'hanja-glyph-lg', entry.char);
      g.setAttribute('lang', 'zh-Hant');
      card.appendChild(g);
      card.appendChild(el('span', 'hanja-reading', entry.meaning + ' ' + entry.sound));
      card.appendChild(el('span', 'hanja-sub-meta', entry.radical));
      hanjaGrid.appendChild(card);
    });
    content.appendChild(hanjaGrid);

    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', 'open');
    }
  }

  function renderEncyclopediaGrid() {
    const query = document.getElementById('hex-search-input').value.trim().toLowerCase();
    const upper = document.getElementById('hex-upper-select').value;
    const lower = document.getElementById('hex-lower-select').value;
    const grid = document.getElementById('hex-grid');
    const countInfo = document.getElementById('hex-count-info');

    clearEl(grid);
    const filtered = HEXAGRAMS.filter(function (hex) {
      if (upper !== 'all' && hex.upper !== upper) return false;
      if (lower !== 'all' && hex.lower !== lower) return false;
      if (!query) return true;
      const haystack = (
        hex.num + ' ' + hex.name + ' ' + hex.hanjaName + ' ' +
        hex.keywords.join(' ') + ' ' + hex.summary
      ).toLowerCase();
      return haystack.indexOf(query) !== -1;
    });

    countInfo.textContent = '총 ' + filtered.length + '개의 괘가 표시되었습니다.';
    filtered.forEach(function (hex) {
      const btn = el('button', 'hex-grid-btn');
      btn.type = 'button';

      const top = el('div', 'hex-grid-top');
      top.appendChild(el('span', 'tag tag-subtle', hex.num + '괘'));
      top.appendChild(renderMiniHexVisual(hex.linesBinary));
      btn.appendChild(top);

      btn.appendChild(el('strong', '', hex.name + ' (' + hex.hanjaName + ')'));
      btn.appendChild(el('span', 'muted-text', hex.upperTrigram.nature + ' · ' + hex.lowerTrigram.nature + ' | ' + hex.keywords.join(', ')));

      btn.addEventListener('click', function () {
        openHexDetailDialog(hex);
      });
      grid.appendChild(btn);
    });
  }

  function initEncyclopediaTab() {
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
    searchInput.addEventListener('input', renderEncyclopediaGrid);
    upperSelect.addEventListener('change', renderEncyclopediaGrid);
    lowerSelect.addEventListener('change', renderEncyclopediaGrid);

    closeBtn.addEventListener('click', function () {
      dialog.close();
    });

    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) {
        dialog.close();
      }
    });

    renderEncyclopediaGrid();
  }

  // ==========================================
  // 7. 초기화
  // ==========================================
  function bootstrap() {
    const todayStr = iching.getLocalDateString(new Date());
    document.getElementById('today-date-label').textContent = formatKoreanDate(todayStr);

    const tabController = initTabs();
    initTodayTab(tabController);
    initHanjaTab();
    initQuizTab();
    initHistoryTab(tabController);
    initEncyclopediaTab();

    // 오늘 날짜로 이미 저장된 괘가 있으면 자동 복원
    const existingToday = storage.getLatestRecordForDate(todayStr);
    if (existingToday) {
      appState.currentReading = iching.hydrateReading(existingToday);
      renderReading(appState.currentReading);
    } else {
      renderReading(null);
    }
  }

  document.addEventListener('DOMContentLoaded', bootstrap);
})(window);
