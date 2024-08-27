export class CustomRoundTrackerManager {
  static SETUP_NAME = "셋업";
  static CLEANUP_NAME = "클린업";
  static SETUP_INITIATIVE = 99;
  static CLEANUP_INITIATIVE = -99;

  /**
   * 전투 시작 시 호출되는 함수
   * @param {Combat} combat - 전투 객체
   */
  static async onCombatStart(combat) {
    console.log("CustomRoundTrackerManager | Combat started");

    try {
      // 셋업 및 클린업 액터 추가
      await CustomRoundTrackerManager.addActor(
        combat,
        CustomRoundTrackerManager.SETUP_NAME,
        CustomRoundTrackerManager.SETUP_INITIATIVE
      );
      await CustomRoundTrackerManager.addActor(
        combat,
        CustomRoundTrackerManager.CLEANUP_NAME,
        CustomRoundTrackerManager.CLEANUP_INITIATIVE
      );

      console.log(
        "CustomRoundTrackerManager | Setup and Cleanup actors added."
      );

      // 전투 시작 후 바로 셋업 차례가 되므로 셋업 메시지를 띄움
      const setupCombatant = combat.combatants.find(
        (c) => c.name === CustomRoundTrackerManager.SETUP_NAME
      );
      if (setupCombatant) {
        CustomRoundTrackerManager.onSetupTurnStart(combat, setupCombatant);
      }
    } catch (error) {
      console.error(
        "CustomRoundTrackerManager | Error during combat start:",
        error
      );
    }
  }

  /**
   * 전투에 액터를 추가하는 함수
   * @param {Combat} combat - 전투 객체
   * @param {string} name - 액터 이름
   * @param {number} initiative - 이니셔티브 값
   */
  static async addActor(combat, name, initiative) {
    const actorData = {
      name: name,
      type: "monster",
      img: "icons/svg/circle.svg",
      data: { initiative: initiative },
    };

    try {
      // 임시 액터 생성
      const actor = await Actor.create(actorData, { temporary: true });

      // 임시 액터가 올바르게 생성되었는지 확인
      if (!actor) {
        throw new Error(`Actor ${name} could not be created.`);
      }

      // 전투에 컴배턴트 추가
      await combat.createEmbeddedDocuments("Combatant", [
        {
          actorId: actor.id,
          name: actor.name,
          initiative: initiative,
        },
      ]);
    } catch (error) {
      console.error(
        `CustomRoundTrackerManager | Error adding ${name} actor:`,
        error
      );
    }
  }

  /**
   * 셋업 턴 시작 시 호출되는 함수
   * @param {Combat} combat - 전투 객체
   * @param {Combatant} setupCombatant - 셋업 컴배턴트 객체
   */
  static onSetupTurnStart(combat, setupCombatant) {
    console.log("CustomRoundTrackerManager | Setup turn started.");
    this.notify("셋업 프로세스가 시작됩니다.");
  }

  /**
   * 턴 종료 시 호출되는 함수
   * @param {Combat} combat - 전투 객체
   * @param {Combatant} prevCombatant - 이전 컴배턴트 객체
   * @param {string} name - 액터 이름
   * @param {string} message - 알림 메시지
   */
  static onTurnEnd(combat, prevCombatant, name, message) {
    if (prevCombatant.name === name) {
      console.log(`CustomRoundTrackerManager | ${name} turn ended.`);
      this.notify(message);
    }
  }

  /**
   * 클린업 턴 시작 시 호출되는 함수
   * @param {Combat} combat - 전투 객체
   * @param {Combatant} cleanupCombatant - 클린업 컴배턴트 객체
   */
  static onCleanupTurnStart(combat, cleanupCombatant) {
    if (cleanupCombatant.name === this.CLEANUP_NAME) {
      console.log("CustomRoundTrackerManager | Cleanup turn started.");
      this.notify("클린업 프로세스가 시작됩니다.");
    }
  }

  /**
   * 알림 메시지를 생성하는 함수
   * @param {string} message - 알림 메시지
   */
  static notify(message) {
    // 화면 알림
    ui.notifications.info(message);

    // 채팅 창 알림
    ChatMessage.create({
      content: `<strong>${message}</strong>`,
      whisper: [], // 모든 플레이어에게 보임
      speaker: { alias: "System" },
    });
  }
}

// 기존의 onSetupTurnEnd와 onCleanupTurnEnd를 onTurnEnd로 대체
CustomRoundTrackerManager.onSetupTurnEnd = function (combat, prevCombatant) {
  this.onTurnEnd(
    combat,
    prevCombatant,
    this.SETUP_NAME,
    "셋업 프로세스가 종료되었습니다."
  );
};

CustomRoundTrackerManager.onCleanupTurnEnd = function (combat, prevCombatant) {
  this.onTurnEnd(
    combat,
    prevCombatant,
    this.CLEANUP_NAME,
    "클린업 프로세스가 종료되었습니다."
  );
};
