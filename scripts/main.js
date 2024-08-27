import { CustomRoundTrackerManager } from "./round-tracker-manager.js";
import { createCustomButtonPanel } from "./ui-manager.js";

Hooks.once("init", async function () {
  console.log(
    "Simple Custom Rounds | Initializing custom round tracker manager"
  );

  Hooks.on("combatStart", (combat) => {
    CustomRoundTrackerManager.onCombatStart(combat);
  });

  // 턴이 변경될 때 호출하여 셋업 및 클린업 차례를 감지 및 종료 알림
  Hooks.on("updateCombat", (combat, changed, options, userId) => {
    if (changed.turn !== undefined) {
      const currentCombatant = combat.combatants.get(
        combat.current?.combatantId
      );
      const previousCombatant = combat.combatants.get(
        combat.previous?.combatantId
      );

      if (previousCombatant) {
        CustomRoundTrackerManager.onSetupTurnEnd(combat, previousCombatant);
        CustomRoundTrackerManager.onCleanupTurnEnd(combat, previousCombatant);
      }

      if (currentCombatant) {
        CustomRoundTrackerManager.onSetupTurnStart(combat, currentCombatant);
        CustomRoundTrackerManager.onCleanupTurnStart(combat, currentCombatant);
      }
    }
  });
});

Hooks.on("ready", () => {
  console.log("Simple Custom Rounds | Module is ready");
  // UI 버튼 생성
  createCustomButtonPanel();
});
