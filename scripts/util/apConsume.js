/**
 * 행동력 소모 함수
 * @param {Object} actor - 행동력을 소모할 배우(Actor) 객체
 * @param {Number} amount - 소모할 행동력의 양
 * @returns {Boolean} - 성공적으로 행동력이 소모되었는지 여부
 */
export async function consumeActionPoints(actor, amount) {
  const currentActionPoints =
    getProperty(actor.system, "battle-status.actionPoints") || 0;

  if (currentActionPoints < amount) {
    ui.notifications.error(`행동력이 부족하여 행동을 수행할 수 없습니다.`);
    return false; // 행동력이 부족함
  }

  await actor.update({
    "system.battle-status.actionPoints": currentActionPoints - amount,
  });
  ui.notifications.info(
    `${actor.name}이(가) ${amount}의 행동력을 소모했습니다.`
  );
  return true; // 성공적으로 행동력을 소모함
}
