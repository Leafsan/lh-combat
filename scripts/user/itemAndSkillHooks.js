import { handleItemUsageInCombat } from "./itemUse.js";
import { handleSkillUsageInCombat } from "./skillUse.js";

// 모듈 로드 시
Hooks.on("ready", (app, html, data) => {
  console.log(
    "ActorSheet 렌더링 완료. item-use 및 action-use 이벤트 바인딩 중..."
  );

  // item-use 클래스의 클릭 이벤트 가로채기
  html.find(".item-use").on("click", async function (event) {
    event.preventDefault();

    // 아이템의 _id를 가져오기
    const itemId = $(this).closest(".item").data("item-id");
    const actor = app.actor;

    if (!actor) {
      ui.notifications.error("배우를 찾을 수 없습니다.");
      return;
    }

    const item = actor.items.get(itemId);
    if (!item) {
      ui.notifications.error("아이템을 찾을 수 없습니다.");
      return;
    }

    // 전투 중인지 여부 확인
    const isInCombat = game.combat && game.combat.started;

    await handleItemUsageInCombat({
      actor: actor,
      item: item,
      isInCombat: isInCombat,
    });
  });

  // action-use 클래스의 클릭 이벤트 가로채기
  html.find(".action-use").on("click", async function (event) {
    event.preventDefault();

    // 스킬의 _id를 가져오기
    const itemId = $(this).closest(".item").data("item-id");
    const actor = app.actor;

    if (!actor) {
      ui.notifications.error("배우를 찾을 수 없습니다.");
      return;
    }

    const item = actor.items.get(itemId);
    if (!item) {
      ui.notifications.error("스킬을 찾을 수 없습니다.");
      return;
    }

    // 전투 중인지 여부 확인
    const isInCombat = game.combat && game.combat.started;

    await handleSkillUsageInCombat({
      actor: actor,
      item: item,
      isInCombat: isInCombat,
    });
  });
});
