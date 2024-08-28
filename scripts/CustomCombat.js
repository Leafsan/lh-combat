import { handleInitiativeTimingItems } from "./initiative_process/useInitiativeTiming.js";
import { setUnactedState } from "./setup_process/setUnactedState.js";
import { handleSetupTimingItems } from "./setup_process/useSetupTiming.js";

export class CustomCombat extends Combat {
  constructor(data, context) {
    super(data, context);
    this.customProcessIndex = 0;
    this.customProcesses = ["setup", "initiative", "main", "cleanup"];
    this.currentProcess = this.customProcesses[this.customProcessIndex];
  }

  // Combat 시작 시 이니셔티브 값을 등록하고 셋업 프로세스를 실행
  async startCombat() {
    let ids = [];

    this.combatants.forEach((combatant) => {
      ids.push(combatant.id);
    });

    // 이니셔티브 값을 계산하여 설정
    await this.rollInitiative(ids);

    // 기본 전투 시작 동작을 수행
    await super.startCombat();
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

      let Init;
      if (c.actor.type === "character") {
        Init = c.actor.system["battle-status"].initiative.total ?? 0;
      } else {
        Init = c.actor.system["battle-status"].initiative ?? 0;
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
    if (this.customProcessIndex < this.customProcesses.length) {
      const processName = this.customProcesses[this.customProcessIndex];
      this.currentProcess = processName;
      await this.runCustomProcess(processName);

      // Move to the next process
      this.customProcessIndex++;
    } else {
      // Reset index and proceed to the next round
      this.customProcessIndex = 0;
      await super.nextTurn(); // Call the original nextTurn to proceed to the next turn
    }

    ui.combat.render(); // UI를 업데이트
  }

  async runCustomProcess(processName) {
    console.log(`Running ${processName} process.`);
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
    console.log(message);
    ui.notifications.info(message);
    ChatMessage.create({ content: message });

    // 전투에 참가 중인 캐릭터를 [미행동] 상태로 설정
    await setUnactedState();

    // 캐릭터의 이니셔티브 순서로 타이밍이 셋업인 아이템/스킬을 확인
    await handleSetupTimingItems();

    ChatMessage.create({ content: "셋업 프로세스가 완료되었습니다." });
  }

  async initiativeProcess() {
    const message = "이니셔티브 프로세스를 실행합니다.";
    console.log(message);
    ui.notifications.info(message);
    ChatMessage.create({ content: message });

    // 캐릭터의 이니셔티브 순서로 타이밍이 이니셔티브인 아이템/스킬을 확인
    await handleInitiativeTimingItems();

    const combatants = game.combat.combatants.contents;

    // 각 캐릭터들의 미행동 상태를 콘솔로 출력
    combatants.forEach((c) => {
      console.log(
        `${c.actor.name}의 미행동 상태: ${c.actor.system["battle-status"].unacted}`
      );
    });

    const unactedCombatants = combatants.filter(
      (c) => c.actor.system["battle-status"].unacted === true
    );

    const waitingCombatants = combatants.filter(
      (c) => c.actor.system["battle-status"].waiting === true
    );

    if (unactedCombatants.length === 0) {
      console.log("미행동 상태인 캐릭터가 없습니다.");
      this.runCustomProcess("cleanup");
      return;
    }

    let priorityCombatant;

    if (waitingCombatants.length > 0) {
      // [대기] 상태 중 [우선권]이 가장 낮은 캐릭터 선택
      priorityCombatant = waitingCombatants.sort(
        (a, b) =>
          a.actor.system["battle-status"].initiative -
          b.actor.system["battle-status"].initiative
      )[0];
    }

    // [미행동] 상태인 캐릭터 중 [우선권]이 가장 높은 캐릭터 선택
    priorityCombatant = unactedCombatants.sort(
      (a, b) =>
        b.actor.system["battle-status"].initiative -
        a.actor.system["battle-status"].initiative
    )[0];

    console.log(
      `우선권이 있는 캐릭터: ${priorityCombatant.actor.name} (${priorityCombatant.actor.system["battle-status"].initiative})`
    );

    let combat = game.combat;
    combat.update({
      turn: combat.turns.findIndex((t) => t.id === priorityCombatant.id),
    });

    priorityCombatant.actor.update({ "system.battle-status.actionPoints": 5 });
  }

  async mainProcess() {
    const message = "메인 프로세스를 실행합니다.";
    // get turn combatant
    let combat = game.combat;

    let currentCombatant = combat.combatants.get(combat.current.combatantId);

    console.log(`${currentCombatant}의 메인 프로세스를 실행합니다.`);
    console.log(currentCombatant);
    console.log(message);
    ui.notifications.info(message);
    ChatMessage.create({ content: message });
  }

  async cleanupProcess() {
    const message = "클린업 프로세스를 실행합니다.";
    console.log(message);
    ui.notifications.info(message);
    ChatMessage.create({ content: message });
  }
}
