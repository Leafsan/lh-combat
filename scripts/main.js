import { CustomCombat } from "./CustomCombat.js";
import "./sq/sqManager.js";

Hooks.on("init", () => {
  CONFIG.Combat.documentClass = CustomCombat;
});

Hooks.on("ready", () => {
  console.log("Log Horizon Combat Manager | Ready");
});

Hooks.on("renderCombatTracker", (app, html, data) => {
  const combat = game.combats.active;
  if (combat && combat.currentProcess) {
    const processElement = `<div class="combat-process">Current Process: <strong>${combat.currentProcess}</strong></div>`;
    html.find(".combat-tracker-header").append(processElement);
  }
});
