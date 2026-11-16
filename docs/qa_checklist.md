# QA 검증 체크리스트

> 검증 일자: 2026-11-16 (Ver.05 피벗 반영)

## 1. 데이터 정합성 검증 (Node 스크립트 자동 검증 완료)

- [x] 팔괘 8개(`qian`, `kun`, `zhen`, `xun`, `kan`, `li`, `gen`, `dui`)의 3효 이진 비트 중복 없음 확인
- [x] 주역 64괘(`1번 중천건` ~ `64번 화수미제`) 누락 없이 64개 모두 존재 확인
- [x] 64괘 각각의 6효 이진 조합(`HEXAGRAM_BY_BITS`)이 정확히 64개로 1:1 매핑됨 확인
- [x] 64괘 × 6효 = 384효 데이터 누락 없음 확인
- [x] 64괘 괘사(원문·독음·해설) 및 대상전(원문·독음·해설) 누락 없이 64괘 전체 완비 확인
- [x] 주역 8괘, 64괘 괘명, 64괘 괘사 원문, 64괘 대상전 원문, 384효 제목에 등장하는 전수 426개 고유 한자가 `HANJA_DICT`(총 433자 완비)에 100% 존재 확인 (`Missing Hanja count: 0`)
- [x] `HANJA_DICT` 433개 한자 전수 필드(char, sound, meaning, radical, strokes, category, note, words) 형식 완전성 확인 (`Malformed entries: 0`)

## 2. 핵심 로직 및 코드 검증 (Node 검증 완료)

- [x] `src/iching.js`: 날짜 기반 일일 추천 괘 계산(`getDailyHexagramNum`), 강독 객체 생성(`buildStudyReading`), 기록 복원(`hydrateReading`) 정상 동작
- [x] `src/storage.js`: 강독 이력 저장, 한자 복습 진도 누적, JSON 백업 내보내기 및 가져오기 정상 동작
- [x] `src/quiz.js`: 오늘의 괘 한자, 팔괘 한자, 괘사·대상전 한자, 전체, 오답 범위 4지선다 퀴즈 및 플래시카드 정상 생성
- [x] `src/app.js`: 문법 오류 없음 및 `index.html` 내 참조 DOM ID 60개 전체 일치 확인 (`Missing IDs: 0 []`)

## 3. UI·접근성 및 디자인 가이드 준수 확인

- [x] 메뉴·라벨·`<option>`·버튼 문구 앞에 블릿(`•`, `-`), 이모지, 장식 기호 미사용 확인
- [x] 동전 던지기·점술 요소 및 성찰 메모 제외, 괘사·대상전·고전 한자 공부 중심 레이아웃 전환 확인
- [x] 키보드 탭 이동(`ArrowLeft`/`ArrowRight`/`Home`/`End`), `hidden="until-found"` + `beforematch`, 네이티브 `<dialog>` 적용 확인
- [x] `주역 입문` 탭: 주역의 본질, 8괘 자연 상징, 64괘 형성 원리, 괘사·대상전 읽는 법, 6효 자리와 호칭 안내 확인
- [x] 사용자 입력값 렌더링 시 `innerHTML` 미사용(`textContent` 사용) 보안 수칙 준수 확인
