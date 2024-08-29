export async function handleAlwaysTimingItems() {
  const combatants = game.combat.combatants.contents;

  for (let combatant of combatants) {
    let actor = combatant.actor;

    // "항상" 타이밍의 아이템/스킬 필터링
    const items = actor.items.filter((item) => item.system.timing === "항상");

    // "스타일" 태그가 있는 스킬만 필터링
    const styleItems = items.filter(
      (item) => item.system.tags && item.system.tags.includes("스타일")
    );

    if (styleItems.length > 0) {
      // 사용자가 "스타일" 스킬을 선택하게 함
      const selectedItem = await new Promise((resolve) => {
        let content = `<label>스타일 스킬을 선택하세요:</label><select id="styleItemSelect">`;
        styleItems.forEach((item) => {
          content += `<option value="${item.id}">${item.name}</option>`;
        });
        content += `</select>`;

        new Dialog({
          title: `${actor.name}의 스타일 스킬 선택`,
          content: content,
          buttons: {
            use: {
              icon: "<i class='fas fa-check'></i>",
              label: "사용",
              callback: (html) => {
                const selectedItemId = html.find("#styleItemSelect").val();
                resolve(actor.items.get(selectedItemId));
              },
            },
            cancel: {
              icon: "<i class='fas fa-times'></i>",
              label: "사용하지 않음",
              callback: () => resolve(null),
            },
          },
        }).render(true);
      });

      if (selectedItem && selectedItem.hasMacro()) {
        try {
          await selectedItem.executeMacro({
            actor: actor,
            item: selectedItem,
            event: null, // 이벤트가 필요 없으므로 null로 설정
          });
        } catch (err) {
          console.error("Error executing macro for item", err);
        }
      } else if (selectedItem) {
        ui.notifications.warn(
          `${selectedItem.name}에 연결된 매크로를 찾을 수 없습니다.`
        );
      }
    } else {
      // 스타일이 아닌 "항상" 타이밍의 아이템/스킬을 실행
      for (let item of items) {
        if (item.hasMacro()) {
          try {
            await item.executeMacro({
              actor: actor,
              item: item,
              event: null, // 이벤트가 필요 없으므로 null로 설정
            });
          } catch (err) {
            console.error("Error executing macro for item", err);
          }
        } else {
          ui.notifications.warn(
            `${item.name}에 연결된 매크로를 찾을 수 없습니다.`
          );
        }
      }
    }
  }
}
