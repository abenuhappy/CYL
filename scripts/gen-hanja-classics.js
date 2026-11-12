#!/usr/bin/env node
/**
 * Generates data/hanja_classics.js — run once when classics hanja set changes.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const hanjaJs = fs.readFileSync(path.join(ROOT, 'data/hanja.js'), 'utf8');
const classicsJs = fs.readFileSync(path.join(ROOT, 'data/classics.js'), 'utf8');
const radMap = JSON.parse(fs.readFileSync('/tmp/radical_ko.json', 'utf8'));
const csv = fs.readFileSync('/tmp/hanja.csv', 'utf8');
const hanjaDicJs = fs.readFileSync('/tmp/hanjaDic.js', 'utf8');
// eslint-disable-next-line no-eval
eval(hanjaDicJs.replace('var hanjaDic', 'global.hanjaDic'));
const hanjaDic = global.hanjaDic;

const existingKeys = new Set([...hanjaJs.matchAll(/'([^']+)':\s*\{/g)].map((m) => m[1]));

const charsNeeded = new Set();
for (const m of classicsJs.matchAll(/classicHanja:\s*\[([^\]]+)\]/g)) {
  for (const s of (m[1].match(/'([^']+)'/g) || [])) {
    const c = s.slice(1, -1);
    if (!existingKeys.has(c)) charsNeeded.add(c);
  }
}
const chars = [...charsNeeded].sort((a, b) => a.localeCompare(b, 'ko'));

/** @type {Map<string, {sound:string,meaning:string,radical:string,strokes:number}>} */
const csvMap = new Map();
const lines = csv.split('\n').slice(1);
for (const line of lines) {
  if (!line.trim()) continue;
  const m = line.match(/^([^,]+),([^,]+),([^,]+),"(\[\[\[.*\]\]\])",([^,]+),(\d+),(\d+)/);
  if (!m) continue;
  const [, mainSound, , hanja, meaningJson, rad, , totalStrokes] = m;
  let meanings = [];
  try {
    meanings = JSON.parse(meaningJson.replace(/'/g, '"'));
  } catch {
    continue;
  }
  const defs = meanings.flatMap((pair) => pair[0] || []);
  const meaning = defs.slice(0, 3).join(', ');
  const sound = mainSound || (meanings[0] && meanings[0][1] && meanings[0][1][0]) || '';
  if (!csvMap.has(hanja) || sound === csvMap.get(hanja).sound) {
    csvMap.set(hanja, {
      sound,
      meaning: meaning || (hanjaDic[hanja] && hanjaDic[hanja][0].def) || '',
      radical: rad,
      strokes: parseInt(totalStrokes, 10),
    });
  }
}

// Per-hexagram classic context for notes
/** @type {Record<string, {ids:string[], dx:string, dxm:string, guaMeaning:string}>} */
const hexCtx = {};
let curId = null;
let dx = '';
let dxm = '';
let guaMeaning = '';
for (const line of classicsJs.split('\n')) {
  const idM = line.match(/^\s*(\d+):\s*\{/);
  if (idM) {
    curId = idM[1];
    dx = '';
    dxm = '';
    guaMeaning = '';
    continue;
  }
  const dxM = line.match(/daXiangOriginal:\s*'([^']+)'/);
  if (dxM) dx = dxM[1];
  const dxmM = line.match(/daXiangMeaning:\s*'([^']+)'/);
  if (dxmM) dxm = dxmM[1];
  const guaM = line.match(/guaMeaning:\s*'([^']+)'/);
  if (guaM) guaMeaning = guaM[1];
  const hM = line.match(/classicHanja:\s*\[([^\]]+)\]/);
  if (hM && curId) {
    const hs = hM[1].match(/'([^']+)'/g).map((s) => s.slice(1, -1));
    for (const c of hs) {
      if (!hexCtx[c]) hexCtx[c] = { ids: [], dx, dxm, guaMeaning };
      if (!hexCtx[c].ids.includes(curId)) hexCtx[c].ids.push(curId);
      hexCtx[c].dx = dx;
      hexCtx[c].dxm = dxm;
    }
  }
}

const GUANAMES = {
  1: '건', 2: '곤', 3: '준', 4: '몽', 5: '수', 6: '송', 7: '사', 8: '비', 9: '소축', 10: '려',
  11: '태', 12: '비', 13: '동인', 14: '대유', 15: '겸', 16: '예', 17: '수', 18: '고', 19: '림',
  20: '관', 21: '서합', 22: '비', 23: '박', 24: '복', 25: '무망', 26: '대축', 27: '이', 28: '대과',
  29: '감', 30: '리', 31: '함', 32: '항', 33: '돈', 34: '대장', 35: '진', 36: '명이', 37: '가인',
  38: '규', 39: '건', 40: '해', 41: '손', 42: '익', 43: '쾌', 44: '구', 45: '취', 46: '승', 47: '곤',
  48: '정', 49: '혁', 50: '정', 51: '진', 52: '간', 53: '점', 54: '귀매', 55: '풍', 56: '려', 57: '손',
  58: '태', 59: '환', 60: '절', 61: '중부', 62: '소과', 63: '기제', 64: '미제',
};

/** Override readings/meanings for 주역-specific senses */
const OVERRIDE = {
  實: { sound: '실', meaning: '참될, 열매' },
  尙: { sound: '상', meaning: '오히려, 높일' },
  敎: { sound: '교', meaning: '가르칠' },
  裒: { sound: '포', meaning: '거둘, 모을' },
  眚: { sound: '생', meaning: '재앙, 허물' },
  講: { sound: '강', meaning: '강론할' },
  見: { sound: '견', meaning: '볼' },
  苦: { sound: '고', meaning: '쓸, 괴로울' },
  號: { sound: '호', meaning: '부르짖을, 호령할' },
  甲: { sound: '갑', meaning: '갑옷, 첫째' },
};

/** 확정된 복합 어휘 (음절 표기) */
const COMPOUND_KR = {
  自彊: '자강', 不息: '불식', 厚德: '후덕', 載物: '재물', 經綸: '경륜', 建侯: '건후',
  建萬國: '건만국', 涉大川: '섭대천', 朋友講習: '우방강습', 講習: '강습', 明夷: '명이',
  用晦而明: '용회이명', 自昭明德: '자소명덕', 繼明照于四方: '계명조사방', 恐懼修省: '공포수성',
  反身修德: '반신수덕', 施祿及下: '시록급하', 除戎器: '제군기', 戒不虞: '계불우', 思患而豫防之: '사환이예방지',
  積小以高大: '적소이고대', 勞民勸相: '로민권상', 匪我求童蒙: '비아구동몽', 童蒙求我: '동몽구아',
  果行育德: '과행육덕', 飲食宴樂: '음식연락', 容民畜衆: '용민축중', 辨上下: '변상하',
  定民志: '정민지', 裒多益寡: '포다익과', 稱物平施: '칭물평시', 繃固根本: undefined,
  潤澤: '윤택', 親諸侯: '친제후', 刑罰: '형벌', 敬以直內: '경이직내', 義以方外: '의이방외',
  明庶政: '명서정', 无敢折獄: '무감절옥', 敬義立直: '경의립직', 方大: '방대',
  感而遂通: '감이수통', 致遠: '치원', 敬以直内: '경이직내',
};

// Build phrase → context from classics originals
const PHRASES_BY_CHAR = {};
const guaTexts = [];
for (const m of classicsJs.matchAll(/(?:guaOriginal|daXiangOriginal):\s*'([^']+)'/g)) {
  guaTexts.push(m[1].replace(/\s/g, ''));
}
function addPhrase(phrase) {
  if (!/^[\u4e00-\u9fff]{2,6}$/.test(phrase)) return;
  for (const c of phrase) {
    if (!PHRASES_BY_CHAR[c]) PHRASES_BY_CHAR[c] = new Set();
    PHRASES_BY_CHAR[c].add(phrase);
  }
}
for (const t of guaTexts) {
  for (let i = 0; i < t.length; i++) {
    for (const len of [2, 3, 4]) {
      if (i + len <= t.length) addPhrase(t.slice(i, i + len));
    }
  }
}

function radicalLabel(rad) {
  const ko = radMap[rad] || rad;
  const isCjkRad = rad.length === 1;
  if (isCjkRad && ko.includes(' ')) {
    const [han, ...rest] = ko.split(' ');
    return `${rad} (${han} ${rest.join(' ')})`;
  }
  return `${rad} (${ko})`;
}

function cleanMeaning(m) {
  return m
    .replace(/\[.*?\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function metaFor(char) {
  const ovr = OVERRIDE[char] || {};
  const csvRow = csvMap.get(char);
  const dic = hanjaDic[char];
  let sound = ovr.sound;
  let meaning = ovr.meaning;
  let radical = csvRow?.radical;
  let strokes = csvRow?.strokes;
  if (!sound && csvRow) sound = csvRow.sound;
  if (!sound && dic) sound = dic[0].kor;
  if (!meaning && csvRow) meaning = cleanMeaning(csvRow.meaning);
  if (!meaning && dic) meaning = dic.map((d) => d.def).join(', ');
  meaning = cleanMeaning(meaning);
  if (!sound || !meaning) {
    throw new Error(`Missing metadata for ${char}: sound=${sound} meaning=${meaning}`);
  }
  if (!radical) radical = char;
  if (!strokes) strokes = 8;
  return { sound, meaning, radical: radicalLabel(radical), strokes };
}

function noteFor(char) {
  const ctx = hexCtx[char];
  if (!ctx || !ctx.ids.length) {
    return '주역 괘사·대상전에서 자주 나오는 어휘로, 괘의 뜻을 읽을 때 기준이 되는 글자입니다.';
  }
  const id = ctx.ids[0];
  const gua = GUANAMES[id] || `${id}괘`;
  const dxParts = ctx.dx.split(/\s+/).filter(Boolean);
  const glyphLine = dxParts.slice(0, Math.min(4, dxParts.length)).join(' ');
  return `${gua}괘 대상전「${glyphLine}」에서 쓰이며, 자연의 상(象)과 군자의 처신을 풀어 쓰는 맥락과 맞닿아 있습니다.`;
}

function soundSeq(hanStr) {
  if (COMPOUND_KR[hanStr]) return COMPOUND_KR[hanStr];
  let s = '';
  for (const c of hanStr) {
    const row = csvMap.get(c);
    const dic = hanjaDic[c];
    s += (OVERRIDE[c]?.sound || row?.sound || (dic && dic[0].kor) || '');
  }
  return s;
}

function wordsFor(char) {
  const candidates = [...(PHRASES_BY_CHAR[char] || [])]
    .filter((p) => p.length >= 2 && p.length <= 4)
    .sort((a, b) => {
      const score = (p) => (COMPOUND_KR[p] ? 10 : 0) + (p.length === 2 ? 2 : 1) + (hexCtx[char]?.dx?.includes(p.split('').join(' ')) ? 1 : 0);
      return score(b) - score(a);
    });
  const out = [];
  for (const phrase of candidates) {
    const kr = soundSeq(phrase);
    if (!kr || kr.length < 2) continue;
    const label = `${kr}(${phrase})`;
    if (!out.includes(label)) out.push(label);
    if (out.length >= 2) break;
  }
  if (out.length < 2) {
    const row = csvMap.get(char);
    const m0 = cleanMeaning((OVERRIDE[char]?.meaning || row?.meaning || '').split(/[,，]/)[0]);
    const sound = OVERRIDE[char]?.sound || row?.sound;
    if (m0 && sound) out.push(`${m0.slice(0, 2)}${sound}(${char})`.replace(/\s/g, ''));
  }
  return out.slice(0, 2);
}

const entries = {};
const missingMeta = [];
for (const char of chars) {
  try {
    const { sound, meaning, radical, strokes } = metaFor(char);
    entries[char] = {
      char,
      sound,
      meaning,
      radical,
      strokes,
      category: '괘사대상',
      note: noteFor(char),
      words: wordsFor(char),
    };
  } catch (e) {
    missingMeta.push(char);
    console.error(e.message);
  }
}

if (missingMeta.length) {
  process.exit(1);
}

const linesOut = [];
linesOut.push('// 괘사·대상전 classicHanja 보충 한자 사전 (hanja.js 이후 로드)');
linesOut.push("(function (global) {");
linesOut.push("  'use strict';");
linesOut.push('');
linesOut.push('  const CLASSICS_HANJA = {');

for (const char of chars) {
  const e = entries[char];
  const wordsJs = e.words.map((w) => `'${w.replace(/'/g, "\\'")}'`).join(', ');
  linesOut.push(
    `    '${char}': { char: '${char}', sound: '${e.sound}', meaning: '${e.meaning.replace(/'/g, "\\'")}', radical: '${e.radical.replace(/'/g, "\\'")}', strokes: ${e.strokes}, category: '괘사대상', note: '${e.note.replace(/'/g, "\\'")}', words: [${wordsJs}] },`
  );
}

linesOut.push('  };');
linesOut.push('');
linesOut.push('  global.DailyIChing = global.DailyIChing || {};');
linesOut.push('  const base = global.DailyIChing.HANJA_DICT || {};');
linesOut.push('  const toAdd = {};');
linesOut.push('  for (const [key, val] of Object.entries(CLASSICS_HANJA)) {');
linesOut.push('    if (!Object.prototype.hasOwnProperty.call(base, key)) {');
linesOut.push('      toAdd[key] = val;');
linesOut.push('    }');
linesOut.push('  }');
linesOut.push('  global.DailyIChing.HANJA_DICT = Object.assign({}, base, toAdd);');
linesOut.push('})(window);');
linesOut.push('');

const outPath = path.join(ROOT, 'data/hanja_classics.js');
fs.writeFileSync(outPath, linesOut.join('\n'), 'utf8');
console.log('Wrote', outPath, 'entries:', chars.length);
