export async function handleSetupTimingItems() {
  const combatants = game.combat.combatants.contents.sort(
    (a, b) => b.initiative - a.initiative
  );

  let message = "<h3>셋업 타이밍 행동</h3>";

  for (let combatant of combatants) {
    let actor = combatant.actor;
    let setupItems = [];

    const items = actor.items.filter((item) => item.system.timing === "셋업");

    if (actor.system.health.value === 0) {
      const noActionMessage = `<p>${actor.name}는 [행동 불능]으로 액션이 불가합니다.</p>`;
      message = message.concat(noActionMessage);
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

      let confirmUse = await new Promise((resolve) => {
        new Dialog({
          title: `${actor.name}의 셋업 타이밍`,
          content: `<p>${actor.name}은(는) 셋업 타이밍에 아이템이나 스킬을 사용하시겠습니까?</p>`,
          buttons: {
            yes: {
              icon: "<i class='fas fa-check'></i>",
              label: "예",
              callback: () => resolve(true),
            },
            no: {
              icon: "<i class='fas fa-times'></i>",
              label: "아니오",
              callback: () => resolve(false),
            },
          },
          close: () => resolve(false),
        }).render(true);
      });

      if (confirmUse) {
        let content = `<label>아이템/스킬을 선택하세요:</label><select id="setupItemSelect">`;
        setupItems.forEach((item) => {
          content += `<option value="${item.id}">${item.name}</option>`;
        });
        content += `</select>`;

        await new Promise((resolve) => {
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
                  const usedItemMessage = `<p>${actor.name}은(는) ${selectedItem.name}을(를) 사용합니다.</p>`;
                  message = message.concat(usedItemMessage);

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
                  resolve();
                },
              },
            },
            close: () => resolve(), // 대화 상자가 닫히면 다음으로 진행
          }).render(true);
        });
      } else {
        const noActionMessage = `<p>${actor.name}는 셋업 타이밍에 아이템이나 스킬을 사용하지 않습니다.</p>`;
        message = message.concat(noActionMessage);
      }
    } else {
      const noActionMessage = `<p>${actor.name}는 셋업 프로세스에 사용할 아이템이나 스킬이 없습니다.</p>`;
      message = message.concat(noActionMessage);
    }
  }

  ChatMessage.create({ content: message });
}
