import { doDamage } from "../util/damage.js";

export async function doPoison() {
  const combatants = game.combat.combatants;
  const actors = combatants.map((combatant) => combatant.actor);

  let message = `<h3>쇠약의 처리</h3>`;

  for (let actor of actors) {
    let hp = actor.system.health.value;
    let poisoned = actor.system["bad-status"].poisoned || 0;

    if (poisoned > 0 && hp > 0) {
      let after = await doDamage(actor, ["direct"], poisoned, false);
      message = message.concat(`<p>${after}</p>`);
    }
  }

  ChatMessage.create({ content: message });
}
