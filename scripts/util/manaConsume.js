/**
 * 마나 소모 함수
 * @param {Object} actor - 마나를 소모할 배우(Actor) 객체
 * @param {Number} amount - 소모할 마나의 양
 * @returns {Boolean} - 성공적으로 마나가 소모되었는지 여부
 */
export async function consumeMana(actor, amount) {
  const currentMP = getProperty(actor.system, "mana.value") || 0;

  if (currentMP < amount) {
    ui.notifications.error(`MP가 부족하여 행동을 수행할 수 없습니다.`);
    return false; // 마나가 부족함
  }

  await actor.update({ "system.mana.value": currentMP - amount });
  ui.notifications.info(`${actor.name}이(가) ${amount} MP를 소모했습니다.`);
  return true; // 성공적으로 마나를 소모함
}
