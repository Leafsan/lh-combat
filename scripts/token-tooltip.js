export function initializeTokenTooltip() {
  Hooks.on("hoverToken", (token, hovered) => {
    if (hovered) {
      showTokenTooltip(token);
    } else {
      removeTokenTooltip(token);
    }
  });
}

function showTokenTooltip(token) {
  const effects = token.actor.effects.contents; // v10에서는 contents로 접근
  if (effects.length === 0) return;

  let tooltipContent = `<strong>${token.name}의 상태:</strong><br>`;
  for (let effect of effects) {
    const label = effect.label || "효과 없음";
    const weaknessValue = effect.flags?.weaknessValue || "수치 없음";
    tooltipContent += `${label}: ${weaknessValue}<br>`;
  }

  const tooltip = document.createElement("div");
  tooltip.classList.add("token-tooltip");
  tooltip.innerHTML = tooltipContent;
  document.body.appendChild(tooltip);

  const tokenPosition = token.object.center;
  tooltip.style.position = "absolute";
  tooltip.style.left = `${tokenPosition.x}px`;
  tooltip.style.top = `${tokenPosition.y - 40}px`; // 토큰 위에 표시
  tooltip.style.transform = "translate(-50%, -100%)";
  tooltip.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  tooltip.style.color = "#fff";
  tooltip.style.padding = "5px";
  tooltip.style.borderRadius = "3px";
  tooltip.style.zIndex = "1000";
  tooltip.style.fontSize = "12px";
  tooltip.style.fontFamily = "Arial, sans-serif";
  tooltip.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
}

function removeTokenTooltip(token) {
  const tooltip = document.querySelector(".token-tooltip");
  if (tooltip) {
    tooltip.remove();
  }
}
