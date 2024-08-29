import { doHeal } from "../util/heal.js";

export async function doRegen() {
  const combatants = game.combat.combatants;
  const actors = combatants.map((combatant) => combatant.actor);

  let message = `<h3>재생의 처리</h3>`;

  for (let actor of actors) {
    let hp = actor.system.health.value;
    let maxHp = actor.system.health.max;
    let regen = actor.system["combat-status"]?.regen || 0;

    if (regen > 0 && hp < maxHp && hp !== 0) {
      hp += regen;
      if (hp > maxHp) {
        hp = maxHp;
      }
      await actor.update({ "system.health.value": hp });
      let after = await doHeal(actor, "재생", regen);

      message = message.concat(`<p>${after}</p>`);
    }
  }
  ChatMessage.create({ content: message });
}
