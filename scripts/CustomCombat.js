import { setUnactedState } from "./setup_process/setUnactedState.js";
import { handleSetupTimingItems } from "./setup_process/useSetupTiming.js";

export class CustomCombat extends Combat {
  constructor(data, context) {
    super(data, context);
    this.customProcessIndex = 0;
    this.customProcesses = ["setup", "initiative", "main", "cleanup"];
    this.currentProcess = this.customProcesses[this.customProcessIndex];
  }

  async startCombat() {
    // 기본 전투 시작 동작을 수행
    await super.startCombat();

    // 셋업 프로세스 실행
    await this.runCustomProcess("setup");

    // 이니셔티브를 계산 및 설정
    await this.handleInitiative();
  }

  async handleInitiative() {
    const combatants = game.combat.combatants.contents;
    const updates = combatants.map((c) => ({
      _id: c.id,
      initiative: c.actor.system.battle - status.initiative.mod || 0,
    }));

    // 이니셔티브 수치로 전투 턴을 정렬
    updates.sort((a, b) => b.initiative - a.initiative);

    // 전투 턴 순서 업데이트
    await this.updateEmbeddedDocuments("Combatant", updates);
    // 전투의 현재 턴을 첫 번째 이니셔티브로 설정
    await this.update({ turn: 0 });

    ui.combat.render(); // UI를 업데이트
  }

  async nextRound() {
    this.customProcessIndex = 0;
    this.currentProcess = this.customProcesses[this.customProcessIndex];
    await this.runCustomProcess(this.currentProcess);

    if (this.customProcessIndex < this.customProcesses.length - 1) {
      this.customProcessIndex++;
      const processName = this.customProcesses[this.customProcessIndex];
      this.currentProcess = processName;
      await this.runCustomProcess(processName);
    } else {
      await super.nextRound();
    }

    ui.combat.render(); // UI 업데이트
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
  }

  async mainProcess() {
    const message = "메인 프로세스를 실행합니다.";
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
