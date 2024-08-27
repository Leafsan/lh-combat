export async function addWeaknessEffect(actor, weaknessValue) {
  // 기존의 쇠약 상태를 확인합니다
  const existingEffects = actor.effects.filter(
    (effect) => effect.label === "쇠약"
  );

  if (existingEffects.length > 0) {
    // 기존의 쇠약 상태가 있을 때, 사용자에게 덮어쓰기 또는 가산 선택 다이얼로그를 표시합니다
    const choice = await new Promise((resolve) => {
      new Dialog({
        title: "쇠약 상태 처리",
        content: `
            <p>대상에게 이미 쇠약 상태가 있습니다. 기존 상태를 덮어쓸까요, 아니면 수치를 가산할까요?</p>
            <form>
              <div class="form-group">
                <label>
                  <input type="radio" name="choice" value="overwrite" checked />
                  덮어쓰기
                </label>
              </div>
              <div class="form-group">
                <label>
                  <input type="radio" name="choice" value="add" />
                  가산
                </label>
              </div>
            </form>
          `,
        buttons: {
          ok: {
            label: "확인",
            callback: (html) => {
              const selected = html.find('[name="choice"]:checked').val();
              resolve(selected);
            },
          },
          cancel: {
            label: "취소",
            callback: () => resolve(null),
          },
        },
        default: "ok",
      }).render(true);
    });

    if (choice === null) {
      ui.notifications.info("작업이 취소되었습니다.");
      return;
    }

    // 기존의 쇠약 상태를 처리합니다
    if (choice === "overwrite") {
      // 기존의 쇠약 상태를 모두 제거합니다
      await actor.deleteEmbeddedDocuments(
        "ActiveEffect",
        existingEffects.map((effect) => effect.id)
      );
    } else if (choice === "add") {
      // 기존의 쇠약 상태에 수치를 가산합니다
      for (let effect of existingEffects) {
        let currentValue = effect.flags.weaknessValue || 0;
        effect.flags.weaknessValue = currentValue + weaknessValue;
        await actor.updateEmbeddedDocuments("ActiveEffect", [effect]);
      }
      ui.notifications.info(
        `${actor.name}의 쇠약 상태에 ${weaknessValue}가 가산되었습니다.`
      );
      return;
    }
  }

  // 새로운 쇠약 상태를 추가합니다
  await actor.createEmbeddedDocuments("ActiveEffect", [
    {
      label: "쇠약",
      icon: "icons/svg/skull.svg", // 상태 아이콘
      changes: [], // 변화 없이 수치만 저장
      duration: { rounds: 10 }, // 상태 지속 시간
      origin: actor.uuid,
      flags: {
        weaknessValue: weaknessValue, // 수치 저장
      },
    },
  ]);

  ui.notifications.info(
    `${actor.name}에게 쇠약(${weaknessValue}) 상태가 적용되었습니다.`
  );
}
export async function addAdditionalHitEffect(
  actor,
  additionalHitsValue,
  count
) {
  for (let i = 0; i < count; i++) {
    // 새로운 추가타 상태를 추가합니다
    await actor.createEmbeddedDocuments("ActiveEffect", [
      {
        label: "추가타",
        icon: "icons/svg/swords.svg", // 상태 아이콘
        changes: [], // 변화 없이 수치만 저장
        duration: { rounds: 10 }, // 상태 지속 시간
        origin: actor.uuid,
        flags: {
          additionalHitsValue: additionalHitsValue, // 수치 저장
        },
      },
    ]);
  }

  ui.notifications.info(
    `${actor.name}에게 ${count}개의 추가타(${additionalHitsValue}) 상태가 적용되었습니다.`
  );
}
