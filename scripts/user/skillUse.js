export async function handleSkillUsageInCombat({ actor, item, isInCombat }) {
  console.log(`전투 중에 스킬 사용: ${item.name}`);

  // 1. 행동력 소모 확인 (전투 중일 때만)
  if (isInCombat) {
    const timing = item.system.timing;
    const actionPointMatch = timing.match(/행동력\s*(\d+)/);

    if (actionPointMatch) {
      const requiredActionPoints = parseInt(actionPointMatch[1]);
      const currentActionPoints =
        getProperty(actor.system, "battle-status.actionPoints") || 0;

      // 행동력이 부족한 경우 스킬 사용 중단
      if (currentActionPoints < requiredActionPoints) {
        ui.notifications.error(
          `행동력이 부족하여 ${item.name}을(를) 사용할 수 없습니다.`
        );
        return;
      }

      // 행동력 소모
      await actor.update({
        "system.battle-status.actionPoints":
          currentActionPoints - requiredActionPoints,
      });
      ui.notifications.info(
        `${actor.name}이(가) ${requiredActionPoints}의 행동력을 소모했습니다.`
      );
    }
  }

  // 2. 코스트 처리 ('헤이트 n' 형태)
  const cost = item.system.cost || "";
  const hateMatch = cost.match(/헤이트\s*(\d+)/);

  if (hateMatch) {
    const hateAmount = parseInt(hateMatch[1]);
    const mpCost = hateAmount * 2;
    const currentMP = getProperty(actor.system, "mana.value") || 0;

    // MP가 부족한 경우 스킬 사용 중단
    if (currentMP < mpCost) {
      ui.notifications.error(
        `MP가 부족하여 ${item.name}을(를) 사용할 수 없습니다.`
      );
      return;
    }

    // MP 소모 (전투 여부와 상관없이 처리)
    await actor.update({ "system.mana.value": currentMP - mpCost });
    ui.notifications.info(`${actor.name}이(가) ${mpCost} MP를 소모했습니다.`);

    // 헤이트 상승 (전투 중일 때만)
    if (isInCombat) {
      const currentHate = getProperty(actor.system, "infos.hate") || 0;
      await actor.update({ "system.infos.hate": currentHate + hateAmount });
      ui.notifications.info(
        `${actor.name}의 헤이트가 ${hateAmount} 상승했습니다.`
      );
    }
  }

  // 3. 스킬에 정의된 추가 매크로 실행
  if (item.flags.itemacro?.macro) {
    try {
      let macroCommand = item.flags.itemacro.macro.command;

      // actor와 item을 매크로에 전달
      await eval(`(async () => { ${macroCommand} })()`).call(this, {
        actor,
        item,
      });
    } catch (error) {
      ui.notifications.error(`스킬 매크로 실행 중 오류 발생: ${error.message}`);
      return; // 오류가 발생하면 여기서 처리를 중단
    }
  }

  // 4. 스킬 사용 완료 알림
  ui.notifications.info(
    `${actor.name}이(가) ${item.name} 스킬을 사용했습니다.`
  );
}
