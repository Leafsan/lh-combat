export async function handleItemUsageInCombat({ actor, item, isInCombat }) {
  console.log(`전투 중에 아이템 사용: ${item.name}`);

  // 전투 중 처리 로직 (예: 행동력 소모)
  if (isInCombat) {
    const timing = item.system.timing;
    const actionPointMatch = timing.match(/행동력\s*(\d+)/);

    if (actionPointMatch) {
      const requiredActionPoints = parseInt(actionPointMatch[1]);
      const currentActionPoints =
        getProperty(actor.system, "battle-status.actionPoints") || 0;

      if (currentActionPoints < requiredActionPoints) {
        ui.notifications.error(
          `행동력이 부족하여 ${item.name}을(를) 사용할 수 없습니다.`
        );
        return;
      }

      await actor.update({
        "system.battle-status.actionPoints":
          currentActionPoints - requiredActionPoints,
      });
      ui.notifications.info(
        `${actor.name}이(가) ${requiredActionPoints}의 행동력을 소모했습니다.`
      );
    }
  }

  // 매크로 실행 (actor와 item을 전역 변수로 설정)
  if (item.flags.itemacro?.macro) {
    try {
      // 전역 변수로 설정하여 매크로 내에서 참조 가능하게 함
      window.currentActor = actor;
      window.currentItem = item;

      let macroCommand = item.flags.itemacro.macro.command;
      await eval(macroCommand);

      // 이후 필요시 전역 변수를 해제
      delete window.currentActor;
      delete window.currentItem;
    } catch (error) {
      ui.notifications.error(
        `아이템 매크로 실행 중 오류 발생: ${error.message}`
      );
      console.error(error); // 콘솔에 전체 오류 로그 출력
      return;
    }
  }

  // 아이템 사용 완료 알림
  ui.notifications.info(`${actor.name}이(가) ${item.name}을(를) 사용했습니다.`);
}
