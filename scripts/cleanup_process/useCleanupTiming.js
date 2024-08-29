export async function handleCleanupTimingItems() {
  const combatants = game.combat.combatants.contents.sort(
    (a, b) => b.initiative - a.initiative
  );

  let message = "<h3>클린업 타이밍 행동</h3>";

  for (let combatant of combatants) {
    let actor = combatant.actor;
    let cleanupItems = [];

    // 아이템과 스킬에서 타이밍이 클린업인 것들만 필터링
    const items = actor.items.filter((item) => item.system.timing === "클린업");

    if (actor.system.health.value === 0) {
      const noActionMessage = `<p>${actor.name}는 [행동 불능]으로 액션이 불가합니다.</p>`;
      message = message.concat(noActionMessage);
      continue;
    }

    if (items.length > 0) {
      // 드롭다운으로 선택지 제공
      cleanupItems = items.map((item) => {
        return {
          name: item.name,
          id: item.id,
          hasMacro: item.flags?.itemacro?.macro ? true : false,
        };
      });

      let content = `<label>아이템/스킬을 선택하세요:</label><select id="cleanupItemSelect">`;
      cleanupItems.forEach((item) => {
        content += `<option value="${item.id}">${item.name}</option>`;
      });
      content += `</select>`;

      await new Promise((resolve) => {
        new Dialog({
          title: `${actor.name}의 클린업 타이밍`,
          content: content,
          buttons: {
            use: {
              icon: "<i class='fas fa-check'></i>",
              label: "사용",
              callback: async (html) => {
                const selectedItemId = html.find("#cleanupItemSelect").val();
                const selectedItem = actor.items.get(selectedItemId);

                // 선택된 아이템/스킬의 매크로 실행
                if (selectedItem.flags?.itemacro?.macro) {
                  const macroCommand =
                    selectedItem.flags.itemacro.macro.command;
                  new Function("args", macroCommand)({
                    actor: actor,
                    item: selectedItem,
                  });
                }

                // 아이템 사용 메시지를 누적
                const usedItemMessage = `<p>${actor.name}은(는) ${selectedItem.name}을(를) 사용합니다.</p>`;
                message = message.concat(usedItemMessage);

                resolve();
              },
            },
            cancel: {
              icon: "<i class='fas fa-times'></i>",
              label: "사용하지 않음",
              callback: () => {
                const noActionMessage = `<p>${actor.name}은(는) 클린업 타이밍에 사용할 아이템이나 스킬을 사용하지 않습니다.</p>`;
                message = message.concat(noActionMessage);
                resolve();
              },
            },
          },
          close: () => resolve(), // 다이얼로그가 닫히면 자동으로 resolve
        }).render(true);
      });
    } else {
      // 클린업 타이밍에 사용할 아이템이나 스킬이 없는 경우 메시지 누적
      const noActionMessage = `<p>${actor.name}는 클린업 프로세스에 사용할 아이템이나 스킬이 없습니다.</p>`;
      message = message.concat(noActionMessage);
    }
  }

  // 모든 전투자의 행동이 완료된 후, 최종 메시지 전송
  ChatMessage.create({ content: message });
}
