export async function resetCharacterState(actor) {
  // 초기화할 상태 목록
  const resetData = {
    "system.combat-status.shield": 0, // 실드 초기화
    "system.combat-status.damageReduction": [], // 경감 초기화
    "system.bad-status.additionalHit": [], // 추가타 초기화
    "system.regeneration": 0, // 재생 초기화
    "system.poison": 0, // 중독 초기화
    "system.bad-status.dazed": false, // 상태 이상 초기화
    "system.bad-status.rigor": false,
    "system.bad-status.confused": false,
    "system.bad-status.staggered": false,
    "system.bad-status.afflicted": false,
    "system.bad-status.overconfident": false,
  };

  // 상태 초기화
  await actor.update(resetData);

  // 초기화 결과 설명 생성
  let resetExplanation = `${actor.name}의 모든 상태가 초기화되었습니다: 실드, 경감, 추가타, 재생, 쇠약, 그리고 상태 이상.`;

  // 결과 반환
  return resetExplanation;
}
