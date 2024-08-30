export async function selectTarget(targetMode = "single", targetCount = 1) {
  return new Promise((resolve) => {
    const dialog = new Dialog({
      title: "타겟 선택",
      content: "<p>스킬을 사용할 타겟을 선택하세요.</p>",
      buttons: {
        select: {
          icon: '<i class="fas fa-check"></i>',
          label: "선택",
          callback: () => {
            const targets = Array.from(game.user.targets);
            console.log("선택된 타겟들: ", targets);

            let selectedTargets = [];

            if (targetMode === "single") {
              if (targets.length > 0) {
                const selectedToken = targets[0];
                if (selectedToken) {
                  resolve(selectedToken.actor); // 단일 액터 객체 반환
                  return;
                }
              }
            } else if (targetMode === "multiple") {
              selectedTargets = targets.map((token) => token.actor);
            } else if (targetMode === "specific") {
              if (targets.length >= targetCount) {
                selectedTargets = targets
                  .slice(0, targetCount)
                  .map((token) => token.actor);
              } else {
                ui.notifications.error(
                  `선택된 타겟이 ${targetCount}명보다 적습니다. 다시 선택해 주세요.`
                );
                resolve(null);
                return;
              }
            }

            if (selectedTargets.length > 0) {
              console.log("선택된 타겟 액터들: ", selectedTargets);
              resolve(selectedTargets); // 선택된 타겟 배열 반환
            } else {
              ui.notifications.error(
                "타겟이 선택되지 않았습니다. 다시 선택해 주세요."
              );
              resolve(null);
            }
          },
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: "취소",
          callback: () => resolve(null),
        },
      },
      default: "select",
      close: () => resolve(null),
    }).render(true);
  });
}
