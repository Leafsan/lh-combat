export async function doHeal(actor, source, healingAmount) {
  // 현재 HP 및 최대 HP 가져오기
  let currentHP = getProperty(actor.system, "health.value") || 0;
  let maxHP = getProperty(actor.system, "health.max") || 0;

  // 치유 후 HP 계산
  let newHP = Math.min(currentHP + healingAmount, maxHP);
  let actualHealing = newHP - currentHP;

  // HP 업데이트
  await actor.update({ "system.health.value": newHP });

  // 치유 결과 설명 생성
  let healingExplanation = `${actor.name}이(가) ${source}에 의해서 ${actualHealing}만큼 치유되었습니다. 현재 HP는 ${newHP}/${maxHP}입니다.`;

  // 결과 반환
  return healingExplanation;
}
