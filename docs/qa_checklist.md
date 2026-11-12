# QA 검증 체크리스트

> 검증 일자: 2026-11-12

## 1. 데이터 정합성 검증 (Node 스크립트 자동 검증 완료)

- [x] 팔괘 8개(`qian`, `kun`, `zhen`, `xun`, `kan`, `li`, `gen`, `dui`)의 3효 이진 비트 중복 없음 확인
- [x] 주역 64괘(`1번 중천건` ~ `64번 화수미제`) 누락 없이 64개 모두 존재 확인
- [x] 64괘 각각의 6효 이진 조합(`HEXAGRAM_BY_BITS`)이 정확히 64개로 1:1 매핑됨 확인
- [x] 64괘 × 6효 = 384효 데이터 누락 없음 확인
- [x] 64괘 `hanjaName` 및 `hanja` 배열의 모든 한자가 `HANJA_DICT`(320자)에 존재함 확인 (`Missing: []`)
- [x] `HEXAGRAM_CLASSICS` 64괘 괘사·대상전 원문·음독·풀이 및 `classicHanja` 전체가 사전·UI·퀴즈에 연동됨 확인

## 2. 핵심 로직 및 코드 검증 (Node 검증 완료)

- [x] `src/iching.js`: 동전 삼전법(6/7/8/9) 및 본괘 → 변효 → 지괘 변환, 변효 개수별 핵심 지침 도출 정상 동작
- [x] `src/storage.js`: 기록 저장, 메모·회고 업데이트, 한자 복습 진도 저장, JSON 백업 내보내기 및 가져오기 정상 동작
- [x] `src/quiz.js`: 오늘의 한자/전체/오답 범위 4지선다 퀴즈 및 덱 생성 정상 동작
- [x] `src/app.js`: `node --check src/app.js` 문법 오류 없음 및 `index.html` 내 참조 DOM ID 80개 전체 일치 확인 (`Missing IDs: []`)

## 3. UI·접근성 및 PM 선호 규칙 준수 확인

- [x] 메뉴·라벨·`<option>`·버튼 문구 앞에 블릿(`•`, `-`), 이모지, 장식 기호 미사용 확인
- [x] `<meta name="color-scheme" content="light dark">` 및 라이트/다크/고대비 모드 CSS 대응 확인
- [x] 키보드 탭 이동(`ArrowLeft`/`ArrowRight`/`Home`/`End`), `hidden="until-found"` + `beforematch`, 네이티브 `<dialog>` 적용 확인
- [x] `도움말` 탭 추가: 본괘·변효·지괘 개념, 동전 삼전법 표, 6효 호칭표(초구~상육) 및 기본 한자 용어 안내 확인
- [x] 사용자 입력값 렌더링 시 `innerHTML` 미사용(`textContent` 사용) 확인
