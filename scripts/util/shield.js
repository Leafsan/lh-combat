export async function grantShield(actor, source, shieldAmount) {
  // 현재 실드 가져오기
  let currentShield = getProperty(actor.system, "combat-status.shield") || 0;

  // 실드 계산: 현재 실드에 부여된 실드를 더함
  let newShield = currentShield + shieldAmount;

  // 실드 업데이트
  await actor.update({ "system.combat-status.shield": newShield });

  // 실드 부여 결과 설명 생성
  let shieldExplanation = `${actor.name}이(가) ${source}에 의해서 ${shieldAmount}의 실드를 얻었습니다. 현재 실드: ${newShield}`;

  // 결과 반환
  return shieldExplanation;
}
