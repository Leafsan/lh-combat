/**
 * 마나 소모 함수
 * @param {Object} actor - 마나를 소모할 배우(Actor) 객체
 * @param {Number} amount - 소모할 마나의 양
 * @returns {Object} - 성공 여부와 관련 메시지를 포함한 객체
 */
export async function consumeMana(actor, amount) {
  const currentMP = foundry.utils.getProperty(actor.system, "mana.value") || 0;

  if (currentMP < amount) {
    const message = `MP가 부족하여 행동을 수행할 수 없습니다.`;
    ui.notifications.error(message);
    return { success: false, message }; // 마나가 부족함
  }

  await actor.update({ "system.mana.value": currentMP - amount });
  const message = `${actor.name}이(가) ${amount} MP를 소모했습니다.`;
  ui.notifications.info(message);
  return { success: true, message }; // 성공적으로 마나를 소모함
}
