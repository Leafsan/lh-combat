import { CustomCombat } from "./CustomCombat.js";
import "./sq/sqManager.js";

// 필요한 함수들을 각 파일에서 가져옵니다.
import { grantAdditionalHit } from "./util/additionalHit.js";
import { consumeActionPoints } from "./util/apConsume.js";
import { doDamage } from "./util/damage.js";
import { grantDamageReduction } from "./util/damageReduction.js";
import { applyStatusEffects } from "./util/debuff.js";
import { resetAllPlayersHate } from "./util/hateReset.js";
import { decreaseHate, increaseHate } from "./util/hateUp.js";
import { doHeal } from "./util/heal.js";
import { consumeMana } from "./util/manaConsume.js";
import { resetCharacterState } from "./util/resetChar.js";
import { grantShield } from "./util/shield.js";
import { selectTarget } from "./util/targetSelect.js";

Hooks.on("init", () => {
  CONFIG.Combat.documentClass = CustomCombat;

  // lhCombatFn 네임스페이스를 사용하여 함수들을 등록합니다.
  game.lhCombatFn = {
    grantAdditionalHit,
    consumeActionPoints,
    doDamage,
    grantDamageReduction,
    applyStatusEffects,
    resetAllPlayersHate,
    increaseHate,
    decreaseHate,
    doHeal,
    consumeMana,
    resetCharacterState,
    grantShield,
    selectTarget,
  };
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
