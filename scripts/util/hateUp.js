/**
 * 헤이트 상승 함수
 * @param {Object} actor - 헤이트를 상승시킬 배우(Actor) 객체
 * @param {Number} amount - 상승시킬 헤이트의 양
 * @returns {Object} - 성공 여부와 관련 메시지를 포함한 객체
 */
export async function increaseHate(actor, amount) {
  const currentHate =
    foundry.utils.getProperty(actor.system, "infos.hate") || 0;
  console.log("현재 헤이트: ", currentHate);

  await actor.update({ "system.infos.hate": currentHate + amount });
  const message = `${actor.name}의 헤이트가 ${amount}만큼 상승했습니다.`;
  ui.notifications.info(message);
  return { success: true, message }; // 성공적으로 헤이트를 상승시킴
}

/**
 * 헤이트 감소 함수
 * @param {Object} actor - 헤이트를 감소시킬 배우(Actor) 객체
 * @param {Number} amount - 감소시킬 헤이트의 양
 * @returns {Object} - 성공 여부와 관련 메시지를 포함한 객체
 */
export async function decreaseHate(actor, amount) {
  const currentHate =
    foundry.utils.getProperty(actor.system, "infos.hate") || 0;
  console.log("현재 헤이트: ", currentHate);

  let newHate = currentHate - amount;
  if (newHate < 0) {
    newHate = 0;
  }

  await actor.update({ "system.infos.hate": newHate });
  const message =
    newHate === 0
      ? `${actor.name}의 헤이트가 0으로 초기화되었습니다.`
      : `${actor.name}의 헤이트가 ${amount}만큼 감소했습니다.`;
  ui.notifications.info(message);
  return { success: true, message }; // 성공적으로 헤이트를 감소시킴
}
