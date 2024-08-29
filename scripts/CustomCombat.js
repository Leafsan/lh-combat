import { doPoison } from "./cleanup_process/poison.js";
import { doRegen } from "./cleanup_process/regen.js";
import { handleInitiativeTimingItems } from "./initiative_process/useInitiativeTiming.js";
import { setUnactedState } from "./setup_process/setUnactedState.js";
import { handleSetupTimingItems } from "./setup_process/useSetupTiming.js";
import { resetAllPlayersHate } from "./util/hateReset.js";

export class CustomCombat extends Combat {
  constructor(data, context) {
    super(data, context);
    this.customProcessIndex = 0;
    this.customProcesses = ["setup", "initiative", "main", "cleanup"];
    this.currentProcess = this.customProcesses[this.customProcessIndex];
  }

  // Combat 시작 시 이니셔티브 값을 등록
  async startCombat() {
    let ids = [];

    this.combatants.forEach((combatant) => {
      ids.push(combatant.id);
    });

    await resetAllPlayersHate();

    // 기본 전투 시작 동작을 수행
    await super.startCombat();

    // 이니셔티브 값을 계산하여 설정
    await this.rollInitiative(ids);
    this.runCustomProcess("setup");
    this.customProcessIndex = 1;
  }

  async endCombat() {
    return Dialog.confirm({
      title: game.i18n.localize("COMBAT.EndTitle"),
      content: `<p>${game.i18n.localize("COMBAT.EndConfirmation")}</p>`,
      yes: async () => {
        this.delete();
        await resetAllPlayersHate();
      },
    });
  }

  async rollInitiative(
    ids,
    { formula = null, updateTurn = true, messageOptions = {} } = {}
  ) {
    // Structure input data
    ids = typeof ids === "string" ? [ids] : ids;
    const currentId = this.combatant?.id;
    let combatantUpdates = [];
    for (const id of ids) {
      // Get Combatant data
      const c = this.combatants.get(id, { strict: true });

      c.actor.system["battle-status"].unacted = false;
      c.actor.system["battle-status"].waiting = false;
      c.actor.system["battle-status"].actionPoints = 0;

      let Init;
      if (c.actor.type === "character") {
        Init = c.actor.system["battle-status"].initiative.total ?? 0;
      } else {
        Init = c.actor.system["battle-status"].initiative;
      }

      // Do not roll for defeated combatants
      if (c.defeated) continue;

      if (c.actor.type === "character") {
        Init += 0.1; // Slight adjustment for characters
      }

      // Draw initiative
      combatantUpdates.push({
        _id: c.id,
        initiative: Init,
      });
    }

    // Ensure the turn order remains with the same combatant
    if (updateTurn && currentId) {
      await this.update({
        turn: this.turns.findIndex((t) => t.id === currentId),
      });
    }

    // Update multiple combatants
    await this.updateEmbeddedDocuments("Combatant", combatantUpdates);

    // Return the updated Combat
    return this;
  }

  async nextTurn() {
    const processMap = {
      setup: async () => {
        await this.setupProcess();
        this.customProcessIndex = 1; // to initiative process
        game.combat.update({ round: game.combat.round + 1 });
      },
      initiative: async () => {
        const isLastTurn = await this.initiativeProcess();
        if (!isLastTurn) {
          this.customProcessIndex = 3; // to cleanup process
        } else {
          this.customProcessIndex = 2; // to main process
        }
      },
      main: async () => {
        await this.mainProcess();
        this.customProcessIndex = 1; // to initiative process
      },
      cleanup: async () => {
        await this.cleanupProcess();
        this.customProcessIndex = 0; // to setup process
      },
    };

    const processName = this.customProcesses[this.customProcessIndex];
    this.currentProcess = processName;
    if (processMap[processName]) {
      await processMap[processName]();
    }

    ui.combat.render(); // UI를 업데이트
  }

  async runCustomProcess(processName) {
    switch (processName) {
      case "setup":
        await this.setupProcess();
        break;
      case "initiative":
        await this.initiativeProcess();
        break;
      case "main":
        await this.mainProcess();
        break;
      case "cleanup":
        await this.cleanupProcess();
        break;
    }
  }

  async setupProcess() {
    const message = "셋업 프로세스를 실행합니다.";
    ui.notifications.info(message);
    ChatMessage.create({ content: `<h2>셋업 프로세스 개시</h2>` });

    // 전투에 참가 중인 캐릭터를 [미행동] 상태로 설정
    await setUnactedState();

    // 캐릭터의 이니셔티브 순서로 타이밍이 셋업인 아이템/스킬을 확인
    await handleSetupTimingItems();

    await ChatMessage.create({
      content: "<h3>셋업 프로세스가 완료되었습니다.</h3>",
    });
  }

  async initiativeProcess() {
    const message = "이니셔티브 프로세스를 실행합니다.";
    ui.notifications.info(message);
    ChatMessage.create({ content: `<h2>이니셔티브 프로세스 개시</h2>` });

    // 캐릭터의 이니셔티브 순서로 타이밍이 이니셔티브인 아이템/스킬을 확인
    await handleInitiativeTimingItems();

    const combatants = game.combat.combatants.contents;

    console.log("combatants: ", combatants);

    let priorityCombatant = null; // 우선권이 있는 캐릭터

    const sortedUnactedCombatants = combatants
      .filter((c) => c.actor.system["battle-status"].unacted === true)
      .filter(
        (c) =>
          c.actor.system["battle-status"].waiting === false ||
          c.actor.system["battle-status"].waiting === undefined
      )
      .sort((a, b) => b.initiative - a.initiative);

    console.log("sortedUnactedCombatants: ", sortedUnactedCombatants);

    const sortedWaitingCombatants = combatants
      .filter((c) => c.actor.system["battle-status"].unacted === true)
      .filter((c) => c.actor.system["battle-status"].waiting === true)
      .sort((a, b) => a.initiative - b.initiative);

    console.log("sortedWaitingCombatants: ", sortedWaitingCombatants);

    if (sortedUnactedCombatants.length > 0) {
      priorityCombatant = sortedUnactedCombatants[0];
    }
    if (
      sortedWaitingCombatants.length > 0 &&
      sortedUnactedCombatants.length === 0
    ) {
      priorityCombatant = sortedWaitingCombatants[0];
    }

    console.log("우선권이 있는 캐릭터: ", priorityCombatant);

    if (!priorityCombatant) {
      ChatMessage.create({
        content:
          "<h3>모든  캐릭터가 [행동완료] 입니다.</h3><p>클린업 프로세스로 진행합니다.</p>",
      });
      return false;
    }

    console.log(
      `우선권이 있는 캐릭터: ${priorityCombatant.actor.name} (${priorityCombatant.actor.system["battle-status"].initiative.total})`
    );

    let combat = game.combat;
    combat.update({
      turn: combat.turns.findIndex((t) => t.id === priorityCombatant.id),
    });

    priorityCombatant.actor.update({ "system.battle-status.actionPoints": 5 });

    ChatMessage.create({
      content: `<h3>${priorityCombatant.actor.name}의 턴입니다.</h3><p>${priorityCombatant.actor.name}의 메인 프로세스로 진행합니다.</p>`,
    });
    return true;
  }

  async mainProcess() {
    const message = "메인 프로세스를 실행합니다.";
    ui.notifications.info(message);
    // get turn combatant
    let combat = game.combat;

    let currentCombatant = combat.combatants.get(combat.current.combatantId);

    const actor = currentCombatant.actor;

    ChatMessage.create({
      content: `<h2>메인 프로세스 개시</h2><p>${currentCombatant.actor.name}의 메인 프로세스를 실행합니다.</p>`,
    });

    actor.system["battle-status"].unacted = false;

    if (actor.system["battle-status"].waiting === false) {
      new Dialog({
        title: `${actor.name}의 대기 상태 전환`,
        content: `
        <p>${actor.name}의 상태를 [대기]로 전환하시겠습니까?</p>
      `,
        buttons: {
          yes: {
            icon: '<i class="fas fa-check"></i>',
            label: "예",
            callback: async () => {
              actor.system["battle-status"].waiting = true;
              actor.system["battle-status"].unacted = true;
              await ChatMessage.create({
                content: `<h3>${actor.name}의 턴이 종료되었습니다.</h3><p>${actor.name}의 상태가 [대기]로 변경되었습니다.</p>`,
              });
              await combat.nextTurn();
            },
          },
          no: {
            icon: '<i class="fas fa-times"></i>',
            label: "아니오",
          },
        },
      }).render(true);
    } else {
      actor.system["battle-status"].waiting = false;
      actor.system["battle-status"].unacted = false;
    }
  }

  async cleanupProcess() {
    const message = "<h2>클린업 프로세스 개시</h2>";
    console.log(message);
    ui.notifications.info(message);
    ChatMessage.create({ content: message });
    await doRegen();
    await doPoison();
  }
}
