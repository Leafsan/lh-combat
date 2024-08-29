export async function handleSetupTimingItems() {
  const combatants = game.combat.combatants.contents.sort(
    (a, b) => b.initiative - a.initiative
  );

  for (let combatant of combatants) {
    let actor = combatant.actor;
    let setupItems = [];

    const items = actor.items.filter((item) => item.system.timing === "셋업");

    if (actor.system.health.value === 0) {
      const noActionMessage = `${actor.name}는 행동 불능으로 액션이 불가합니다.`;
      console.log(noActionMessage);
      ChatMessage.create({ content: noActionMessage });
      continue;
    }

    if (items.length > 0) {
      setupItems = items.map((item) => {
        return {
          name: item.name,
          id: item.id,
          hasMacro: item.flags?.itemacro?.macro ? true : false,
        };
      });

      let content = `<label>아이템/스킬을 선택하세요:</label><select id="setupItemSelect">`;
      setupItems.forEach((item) => {
        content += `<option value="${item.id}">${item.name}</option>`;
      });
      content += `</select>`;

      new Dialog({
        title: `${actor.name}의 셋업 타이밍`,
        content: content,
        buttons: {
          use: {
            icon: "<i class='fas fa-check'></i>",
            label: "사용",
            callback: async (html) => {
              const selectedItemId = html.find("#setupItemSelect").val();
              const selectedItem = actor.items.get(selectedItemId);

              if (selectedItem) {
                console.log(selectedItem);
                if (selectedItem.hasMacro()) {
                  try {
                    await selectedItem.executeMacro({
                      actor: actor,
                      item: selectedItem,
                    });
                  } catch (err) {
                    console.error("Error executing macro for item", err);
                  }
                }
              }
            },
          },
        },
      }).render(true);
    } else {
      const noActionMessage = `${actor.name}는 셋업 프로세스에 사용할 아이템이나 스킬이 없습니다.`;
      console.log(noActionMessage);
      ChatMessage.create({ content: noActionMessage });
    }
  }
}
