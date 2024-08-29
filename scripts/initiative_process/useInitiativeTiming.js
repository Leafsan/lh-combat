export async function handleInitiativeTimingItems() {
  const combatants = game.combat.combatants.contents;

  for (let combatant of combatants) {
    let actor = combatant.actor;
    let initiativeItems = [];

    // 아이템과 스킬에서 타이밍이 이니셔티브인 것들만 필터링
    const items = actor.items.filter(
      (item) => item.system.timing === "이니셔티브"
    );

    if (actor.system.health.value === 0) {
      const noActionMessage = `${actor.name}는 행동 불능으로 액션이 불가합니다.`;
      console.log(noActionMessage);
      ChatMessage.create({ content: noActionMessage });
      continue;
    }

    if (items.length > 0) {
      // 드롭다운으로 선택지 제공
      initiativeItems = items.map((item) => {
        return {
          name: item.name,
          id: item.id,
          hasMacro: item.flags?.itemacro?.macro ? true : false,
        };
      });

      let content = `<label>아이템/스킬을 선택하세요:</label><select id="initiativeItemSelect">`;
      initiativeItems.forEach((item) => {
        content += `<option value="${item.id}">${item.name}</option>`;
      });
      content += `</select>`;

      new Dialog({
        title: `${actor.name}의 이니셔티브 타이밍`,
        content: content,
        buttons: {
          use: {
            icon: "<i class='fas fa-check'></i>",
            label: "사용",
            callback: async (html) => {
              const selectedItemId = html.find("#initiativeItemSelect").val();
              const selectedItem = actor.items.get(selectedItemId);

              // 선택된 아이템/스킬의 매크로 실행
              if (selectedItem.flags?.itemacro?.macro) {
                const macroCommand = selectedItem.flags.itemacro.macro.command;
                new Function("args", macroCommand)({
                  actor: actor,
                  item: selectedItem,
                });
              } else {
                ChatMessage.create({
                  content: `${selectedItem.name}을(를) 사용합니다.`,
                });
              }
            },
          },
        },
      }).render(true);
    } else {
      // 이니셔티브 타이밍에 사용할 아이템이나 스킬이 없는 경우 메시지 출력
      const noActionMessage = `${actor.name}는 이니셔티브 프로세스에 사용할 아이템이나 스킬이 없습니다.`;
      console.log(noActionMessage);
      ChatMessage.create({ content: noActionMessage });
    }
  }
}
