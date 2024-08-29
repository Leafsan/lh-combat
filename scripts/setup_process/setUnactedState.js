export async function setUnactedState() {
  let message = `<h3>전투에 참가 중인 캐릭터를 [미행동] 상태로 설정합니다.</h3>`;

  // 모든 전투에 참여 중인 토큰을 가져오기
  const combatants = game.combat.combatants;

  for (let combatant of combatants) {
    let actor = combatant.actor;
    if (actor.system.health.value > 0) {
      // HP가 0이 아닌 경우 [미행동] 상태로 설정
      actor.system["battle-status"].unacted = true;

      console.log(
        `${actor.name}의 [미행동] 상태 : ${actor.system["battle-status"].unacted}`
      );

      const actorName = actor.name;
      const actionMessage = `<p>${actorName}는 [미행동] 상태가 되었습니다.</p>`;
      message = message.concat(actionMessage);
    } else {
      // HP가 0인 경우 (전투불능 상태) 메시지 출력
      const actorName = actor.name;
      const skipMessage = `<p>${actorName}는 전투불능 상태입니다. [미행동] 상태로 전환되지 않았습니다.</p>`;
      message = message.concat(skipMessage);
    }
  }

  ChatMessage.create({ content: message });
}
