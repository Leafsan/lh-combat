export class CustomRoundTrackerManager {
  static async onCombatStart(combat) {
    console.log("CustomRoundTrackerManager | Combat started");

    // 셋업 액터 추가
    await this.addSetupActor(combat);

    // 클린업 액터 추가
    await this.addCleanupActor(combat);

    console.log("CustomRoundTrackerManager | Setup and Cleanup actors added.");

    // 전투 시작 후 바로 셋업 차례가 되므로 셋업 메시지를 띄움
    const setupCombatant = combat.combatants.find((c) => c.name === "셋업");
    if (setupCombatant) {
      this.onSetupTurnStart(combat, setupCombatant);
    }
  }

  static async addSetupActor(combat) {
    const setupActorData = {
      name: "셋업",
      type: "monster",
      img: "icons/svg/mystery-man.svg",
      data: { initiative: 99 },
    };

    const setupActor = await Actor.create(setupActorData, { temporary: true });
    await combat.createEmbeddedDocuments("Combatant", [
      {
        actorId: setupActor.id,
        name: "셋업",
        initiative: 99,
      },
    ]);
  }

  static async addCleanupActor(combat) {
    const cleanupActorData = {
      name: "클린업",
      type: "monster",
      img: "icons/svg/mystery-man.svg",
      data: { initiative: -99 },
    };

    const cleanupActor = await Actor.create(cleanupActorData, {
      temporary: true,
    });
    await combat.createEmbeddedDocuments("Combatant", [
      {
        actorId: cleanupActor.id,
        name: "클린업",
        initiative: -99,
      },
    ]);
  }

  static onSetupTurnStart(combat, setupCombatant) {
    console.log("CustomRoundTrackerManager | Setup turn started.");

    // 화면 알림
    ui.notifications.info("셋업 프로세스가 시작됩니다.");

    // 채팅 창 알림
    ChatMessage.create({
      content: "<strong>셋업 프로세스가 시작됩니다.</strong>",
      whisper: [], // 모든 플레이어에게 보임
      speaker: { alias: "System" },
    });
  }

  static onSetupTurnEnd(combat, prevCombatant) {
    if (prevCombatant.name === "셋업") {
      console.log("CustomRoundTrackerManager | Setup turn ended.");

      // 화면 알림
      ui.notifications.info("셋업 프로세스가 종료되었습니다.");

      // 채팅 창 알림
      ChatMessage.create({
        content: "<strong>셋업 프로세스가 종료되었습니다.</strong>",
        whisper: [], // 모든 플레이어에게 보임
        speaker: { alias: "System" },
      });
    }
  }

  static onCleanupTurnStart(combat, cleanupCombatant) {
    if (cleanupCombatant.name === "클린업") {
      console.log("CustomRoundTrackerManager | Cleanup turn started.");

      // 화면 알림
      ui.notifications.info("클린업 프로세스가 시작됩니다.");

      // 채팅 창 알림
      ChatMessage.create({
        content: "<strong>클린업 프로세스가 시작됩니다.</strong>",
        whisper: [], // 모든 플레이어에게 보임
        speaker: { alias: "System" },
      });
    }
  }

  static onCleanupTurnEnd(combat, prevCombatant) {
    if (prevCombatant.name === "클린업") {
      console.log("CustomRoundTrackerManager | Cleanup turn ended.");

      // 화면 알림
      ui.notifications.info("클린업 프로세스가 종료되었습니다.");

      // 채팅 창 알림
      ChatMessage.create({
        content: "<strong>클린업 프로세스가 종료되었습니다.</strong>",
        whisper: [], // 모든 플레이어에게 보임
        speaker: { alias: "System" },
      });
    }
  }
}
