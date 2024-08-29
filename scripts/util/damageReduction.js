export async function grantDamageReduction(
  actor,
  source,
  reductionType,
  reductionAmount
) {
  // 현재 경감 가져오기
  let currentReductions =
    getProperty(actor.system, "combat-status.damageReduction") || [];

  // 새로운 경감 추가
  currentReductions.push({ type: reductionType, value: reductionAmount });

  // 경감 업데이트
  await actor.update({
    "system.combat-status.damageReduction": currentReductions,
  });

  // 경감 부여 결과 설명 생성
  let reductionExplanation = `${
    actor.name
  }이(가) ${source}에 의해 ${reductionType} 속성의 피해 경감 ${reductionAmount}를 부여받았습니다. 현재 경감: ${currentReductions
    .map((r) => `${r.type}(${r.value})`)
    .join(", ")}`;

  // 결과 반환
  return reductionExplanation;
}
