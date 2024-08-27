import { addWeaknessEffect } from "./effects-manager.js";
import { addAdditionalHitEffect } from "./effects-manager.js";

export function createCustomButtonPanel() {
  if (!game.user.isGM) return;

  // HTML 및 CSS 스타일 추가
  const style = `
    <style>
      #custom-button-panel {
        position: fixed;
        bottom: 20px;
        left: 20px;
        z-index: 1000;
        background-color: rgba(0, 0, 0, 0.8);
        border-radius: 5px;
        padding: 5px;
        display: flex;
        align-items: center;
        color: #fff;
        height: 50px; /* 패널의 고정 높이 설정 */
        box-sizing: border-box; /* 패딩이 높이에 포함되도록 설정 */
      }
      #drag-handle {
        width: 30px;
        height: 100%; /* 핸들이 패널 전체 높이를 차지하도록 설정 */
        background-color: #333;
        border-radius: 3px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: move;
        margin-right: 5px;
      }
      #custom-button-panel button {
        margin-right: 5px;
        padding: 5px 10px;
        background-color: #007bff;
        border: none;
        border-radius: 3px;
        color: #fff;
        font-size: 14px;
        cursor: pointer;
        height: 100%; /* 버튼이 패널의 높이에 맞도록 설정 */
      }
      #custom-button-panel button:hover {
        background-color: #0056b3;
      }
    </style>
  `;

  const html = `
    <div id="custom-button-panel">
      <div id="drag-handle">&#9776;</div> <!-- 햄버거 메뉴 아이콘 -->
      <button id="add-weakness">쇠약</button>
      <button id="add-additional-hit">추가타</button>
    </div>
  `;

  // 페이지에 스타일과 HTML 추가
  document.body.insertAdjacentHTML("beforeend", style + html);

  // 드래그 앤 드롭 기능 추가
  const panel = document.getElementById("custom-button-panel");
  const dragHandle = document.getElementById("drag-handle");

  let isDragging = false;
  let startX, startY, initialLeft, initialTop;

  dragHandle.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    initialLeft = parseInt(window.getComputedStyle(panel).left, 10);
    initialTop = parseInt(window.getComputedStyle(panel).top, 10);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });

  function onMouseMove(e) {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    panel.style.left = `${initialLeft + dx}px`;
    panel.style.top = `${initialTop + dy}px`;
  }

  function onMouseUp() {
    isDragging = false;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }

  // 버튼 이벤트 리스너 설정
  document
    .getElementById("add-weakness")
    .addEventListener("click", async () => {
      const selectedTokens = canvas.tokens.controlled;
      if (selectedTokens.length === 0) {
        ui.notifications.warn("먼저 토큰을 선택하세요.");
        return;
      }

      const weaknessValue = await new Promise((resolve) => {
        new Dialog({
          title: "쇠약 수치 설정",
          content: `
          <form>
            <div class="form-group">
              <label>쇠약 수치:</label>
              <input type="number" id="weakness-value" name="weakness-value" value="1" />
            </div>
          </form>
        `,
          buttons: {
            ok: {
              label: "확인",
              callback: (html) => {
                const value = parseInt(
                  html.find('[name="weakness-value"]').val()
                );
                resolve(value);
              },
            },
            cancel: {
              label: "취소",
              callback: () => resolve(null),
            },
          },
          default: "ok",
        }).render(true);
      });

      if (weaknessValue === null) {
        ui.notifications.info("작업이 취소되었습니다.");
        return;
      }

      for (let token of selectedTokens) {
        await addWeaknessEffect(token.actor, weaknessValue);
      }

      ui.notifications.info(
        `${selectedTokens.length}개의 토큰에 쇠약 상태가 적용되었습니다.`
      );
    });

  document
    .getElementById("add-additional-hit")
    .addEventListener("click", async () => {
      const selectedTokens = canvas.tokens.controlled;
      if (selectedTokens.length === 0) {
        ui.notifications.warn("먼저 토큰을 선택하세요.");
        return;
      }

      const { additionalHitsValue, count } = await new Promise((resolve) => {
        new Dialog({
          title: "추가타 수치 및 개수 설정",
          content: `
          <form>
            <div class="form-group">
              <label>추가타 수치:</label>
              <input type="number" id="additional-hits-value" name="additional-hits-value" value="1" />
            </div>
            <div class="form-group">
              <label>개수:</label>
              <input type="number" id="additional-hits-count" name="additional-hits-count" value="1" />
            </div>
          </form>
        `,
          buttons: {
            ok: {
              label: "확인",
              callback: (html) => {
                const value = parseInt(
                  html.find('[name="additional-hits-value"]').val()
                );
                const count = parseInt(
                  html.find('[name="additional-hits-count"]').val()
                );
                resolve({ additionalHitsValue: value, count: count });
              },
            },
            cancel: {
              label: "취소",
              callback: () => resolve(null),
            },
          },
          default: "ok",
        }).render(true);
      });

      if (additionalHitsValue === null) {
        ui.notifications.info("작업이 취소되었습니다.");
        return;
      }

      for (let token of selectedTokens) {
        await addAdditionalHitEffect(token.actor, additionalHitsValue, count);
      }

      ui.notifications.info(
        `${selectedTokens.length}개의 토큰에 추가타 상태(${additionalHitsValue}, ${count}개)가 적용되었습니다.`
      );
    });
}
