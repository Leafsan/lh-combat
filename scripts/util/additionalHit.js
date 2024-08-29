export async function grantAdditionalHit(actor, source, additionalHitAmount) {
  // 현재 추가타 가져오기
  let currentAdditionalHits =
    getProperty(actor.system, "bad-status.additionalHit") || [];

  // 새로운 추가타 추가
  currentAdditionalHits.push(additionalHitAmount);

  // 추가타 업데이트
  await actor.update({
    "system.bad-status.additionalHit": currentAdditionalHits,
  });

  // 추가타 부여 결과 설명 생성
  let additionalHitExplanation = `${
    actor.name
  }이(가) ${source}에 의해서 ${additionalHitAmount}의 추가타를 얻었습니다. 현재 추가타: ${currentAdditionalHits.join(
    ", "
  )}`;

  // 결과 반환
  return additionalHitExplanation;
}
