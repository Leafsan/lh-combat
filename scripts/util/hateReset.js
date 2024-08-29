export async function resetAllPlayersHate() {
  // 현재 게임에 있는 모든 플레이어 캐릭터(actor) 가져오기
  let playerActors = game.actors.filter((actor) => actor.hasPlayerOwner);

  // 각 플레이어 캐릭터의 헤이트를 0으로 초기화
  for (let actor of playerActors) {
    await actor.update({ "system.infos.hate": 0 });
  }

  // 초기화 결과 설명 생성
  let resetExplanation = `모든 플레이어 캐릭터의 헤이트가 0으로 초기화되었습니다.`;

  // 결과 반환
  return resetExplanation;
}
