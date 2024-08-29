export async function setUnactedState() {
  const message = "전투에 참가 중인 캐릭터를 [미행동] 상태로 설정합니다.";
  console.log(message);
  ui.notifications.info(message);
  ChatMessage.create({ content: message });

  // 모든 전투에 참여 중인 토큰을 가져오기
  const combatants = game.combat.combatants;

  for (let combatant of combatants) {
    let actor = combatant.actor;
    if (actor.system.health.value > 0) {
      // HP가 0이 아닌 경우 [미행동] 상태로 설정
      actor.system["battle-status"].unacted = true;

      const actorName = actor.name;
      const actionMessage = `${actorName}는 [미행동] 상태가 되었습니다.`;
      console.log(actor.system["battle-status"].unacted);
      console.log(actionMessage);
      ChatMessage.create({ content: actionMessage });
    } else {
      // HP가 0인 경우 (전투불능 상태) 메시지 출력
      const actorName = actor.name;
      const skipMessage = `${actorName}는 전투불능 상태입니다. [미행동] 상태로 전환되지 않았습니다.`;
      console.log(skipMessage);
      ChatMessage.create({ content: skipMessage });
    }
  }

  ChatMessage.create({ content: "셋업이 완료되었습니다." });
}
