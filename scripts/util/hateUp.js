/**
 * 헤이트 상승 함수
 * @param {Object} actor - 헤이트를 상승시킬 배우(Actor) 객체
 * @param {Number} amount - 상승시킬 헤이트의 양
 * @returns {Boolean} - 성공적으로 헤이트가 상승되었는지 여부
 */
export async function increaseHate(actor, amount) {
  const currentHate = getProperty(actor.system, "infos.hate") || 0;

  await actor.update({ "system.infos.hate": currentHate + amount });
  ui.notifications.info(`${actor.name}의 헤이트가 ${amount}만큼 상승했습니다.`);
  return true; // 성공적으로 헤이트를 상승시킴
}
