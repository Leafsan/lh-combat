export async function applyStatusEffects(actor, source, statusEffects) {
  // 현재 상태 이상 가져오기
  let currentStatusEffects = getProperty(actor.system, "bad-status") || {};

  // 상태 이상 부여 처리
  for (let effect of statusEffects) {
    if (currentStatusEffects.hasOwnProperty(effect)) {
      currentStatusEffects[effect] = true;
    }
  }

  // 상태 이상 업데이트
  await actor.update({ "system.bad-status": currentStatusEffects });

  // 부여된 상태 이상 목록 생성
  let appliedEffects = statusEffects
    .filter((effect) => currentStatusEffects[effect])
    .join(", ");

  // 상태 이상 부여 결과 설명 생성
  let statusExplanation = `${actor.name}이(가) ${source}에 의해 다음 상태 이상을 부여받았습니다: ${appliedEffects}.`;

  // 결과 반환
  return statusExplanation;
}
