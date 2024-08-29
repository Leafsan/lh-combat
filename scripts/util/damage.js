export async function doDamage(
  actor,
  damageTypes,
  damage,
  isOnAttack,
  hateMod
) {
  // 초기 설정
  let currentHP = getProperty(actor.system, "health.value") || 0;
  let maxHP = getProperty(actor.system, "health.max") || 0;
  let initialDamage = damage; // 초기 피해 저장
  let directDamage = 0; // 헤이트로 인한 직접 대미지 초기화

  // 피해 설명 초기화
  let damageExplanation = [];

  // 전투 중 가장 높은 헤이트 수치 확인 및 직접 대미지 계산
  if (actor.hasPlayerOwner && game.combat) {
    let highestHatePlayer = game.combat.combatants.reduce(
      (highest, combatant) => {
        let hate = getProperty(combatant.actor.system, "infos.hate") || 0;
        return hate > (highest.hate || 0) ? { combatant, hate } : highest;
      },
      {}
    );

    let actorHate = getProperty(actor.system, "infos.hate") || 0;

    if (actor.id === highestHatePlayer.combatant.actor.id) {
      directDamage = actorHate * hateMod;
      damageExplanation.push(
        `${actor.name}이(가) 가장 높은 헤이트(${actorHate})를 가지고 있어 ${directDamage}의 직접 대미지를 추가로 받았습니다.`
      );
    }
  }

  // 실드 처리
  let shield = getProperty(actor.system, "combat-status.shield") || 0;
  let totalDamage = damage + directDamage; // 총 피해 = 일반 피해 + 직접 대미지
  let shieldDamage = Math.min(shield, totalDamage);
  totalDamage -= shieldDamage;
  shield -= shieldDamage;

  if (shieldDamage > 0) {
    damageExplanation.push(
      `${shieldDamage}의 피해가 실드에 의해 차단되었습니다. 남은 실드: ${shield}`
    );
  }

  // 실드 업데이트
  await actor.update({ "system.combat-status.shield": shield });

  // 피해 경감 확인
  let damageReduction =
    getProperty(actor.system, "combat-status.damageReduction") || [];
  let highestReduction = 0;
  let reductionType = "";

  // 경감 처리
  for (let reduction of damageReduction) {
    if (
      damageTypes.some(
        (type) => type === reduction.type || reduction.type === "all"
      )
    ) {
      if (reduction.value > highestReduction) {
        highestReduction = reduction.value;
        reductionType = reduction.type;
      }
    }
  }

  if (highestReduction > 0) {
    totalDamage = Math.max(totalDamage - highestReduction, 0);
    damageExplanation.push(
      `${highestReduction}의 피해가 경감(${reductionType})되었습니다.`
    );
  }

  // 물리 방어력 적용 (물리 대미지일 경우)
  if (damageTypes.includes("physical")) {
    let physicalDefense =
      getProperty(actor.system, "battle-status.defense.phys") || 0;
    totalDamage = Math.max(totalDamage - physicalDefense, 0);
    if (physicalDefense > 0) {
      damageExplanation.push(
        `물리 방어력(${physicalDefense})에 의해 피해가 차감되었습니다.`
      );
    }
  }

  // 추가타 처리 (isOnAttack이 true일 때만 적용)
  if (isOnAttack) {
    let additionalHit =
      getProperty(actor.system, "bad-status.additionalHit") || [];
    if (additionalHit.length > 0) {
      let highestAdditionalHit = Math.max(...additionalHit);
      totalDamage += highestAdditionalHit;
      damageExplanation.push(
        `추가타(${highestAdditionalHit})가 적용되었습니다.`
      );

      // 추가타를 배열에서 제거
      additionalHit = additionalHit.filter(
        (hit) => hit !== highestAdditionalHit
      );
      await actor.update({ "system.bad-status.additionalHit": additionalHit });
    }
  }

  // 최종 피해 적용
  let newHP = Math.max(currentHP - totalDamage, 0);
  await actor.update({ "system.health.value": newHP });

  // 최종 피해 설명 추가
  let damageTypeExplanation = damageTypes.join(", ");
  damageExplanation.push(
    `최종 피해는 ${totalDamage}(${damageTypeExplanation})이며, ${actor.name}의 현재 HP는 ${newHP}/${maxHP}입니다.`
  );

  // 결과 반환
  return damageExplanation.join(" ");
}
