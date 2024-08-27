import { CustomRoundTrackerManager } from "./managers/round-tracker-manager.js";

Hooks.once("init", async function () {
  console.log(
    "Simple Custom Rounds | Initializing custom round tracker manager"
  );

  Hooks.on("combatStart", CustomRoundTrackerManager.onCombatStart);

  Hooks.on("updateCombat", (combat, changed) => {
    if (changed.turn !== undefined) {
      handleTurnChange(combat);
    }
  });
});

Hooks.on("ready", () => {
  console.log("Simple Custom Rounds | Module is ready");
});

function handleTurnChange(combat) {
  const currentCombatant = combat.combatants.get(combat.current?.combatantId);
  const previousCombatant = combat.combatants.get(combat.previous?.combatantId);

  if (previousCombatant) {
    CustomRoundTrackerManager.onSetupTurnEnd(combat, previousCombatant);
    CustomRoundTrackerManager.onCleanupTurnEnd(combat, previousCombatant);
  }

  if (currentCombatant) {
    CustomRoundTrackerManager.onSetupTurnStart(combat, currentCombatant);
    CustomRoundTrackerManager.onCleanupTurnStart(combat, currentCombatant);
  }
}
