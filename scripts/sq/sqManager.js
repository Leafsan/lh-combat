let mapSquares;

// 전투가 시작될 때 맵을 구획으로 나눔
Hooks.on("combatStart", async (combat) => {
  console.log("전투가 시작되었습니다. 맵을 구획으로 나눕니다.");

  // 맵을 8x8 구획으로 나누는 함수를 호출합니다.
  mapSquares = divideMapIntoSquares(8);

  // 구획된 맵을 콘솔에 출력합니다.
  console.log("구획된 맵:", mapSquares);
});

// 전투 맵을 8x8 구획으로 나누는 함수
function divideMapIntoSquares(squaresPerSide) {
  const scene = game.scenes.active;
  if (!scene) return;

  const gridSize = scene.grid.size;
  const mapWidth = scene.width;
  const mapHeight = scene.height;

  // 각 구획의 크기를 계산합니다.
  const squareWidth = Math.floor(mapWidth / squaresPerSide);
  const squareHeight = Math.floor(mapHeight / squaresPerSide);

  let squares = {};

  for (let y = 0; y < squaresPerSide; y++) {
    for (let x = 0; x < squaresPerSide; x++) {
      const squareName = `Sq${x + 1},${y + 1}`;
      const topLeftX = x * squareWidth;
      const topLeftY = y * squareHeight;

      squares[squareName] = {
        topLeftX,
        topLeftY,
        bottomRightX: topLeftX + squareWidth - 1,
        bottomRightY: topLeftY + squareHeight - 1,
      };

      console.log(`구획 ${squareName}: `, squares[squareName]);
    }
  }

  return squares;
}

// 마우스 클릭 이벤트 감지
Hooks.on("ready", () => {
  canvas.stage.on("mousedown", (event) => {
    // 화면 좌표를 월드 좌표로 변환
    const { x, y } = event.data.getLocalPosition(canvas.app.stage);

    // 그리드 좌표를 월드 좌표로 변환
    const [gridX, gridY] = canvas.grid.getTopLeft(x, y);

    // 변환된 그리드 좌표 출력
    console.log(`클릭한 그리드 좌표: (${gridX}, ${gridY})`);

    // 클릭한 위치가 어느 구획에 속하는지 확인
    const square = getSquareForCoordinates(gridX, gridY);

    if (square) {
      console.log(`클릭한 위치는 ${square}에 속합니다.`);
    } else {
      console.log("해당 위치는 어떤 구획에도 속하지 않습니다.");
    }
  });
});

// 클릭한 좌표가 속한 구획(Sq)을 계산하는 함수
function getSquareForCoordinates(x, y) {
  if (!mapSquares) {
    console.log("맵이 아직 구획으로 나누어지지 않았습니다.");
    return null;
  }

  for (const squareName in mapSquares) {
    const sq = mapSquares[squareName];
    if (
      x >= sq.topLeftX &&
      x <= sq.bottomRightX &&
      y >= sq.topLeftY &&
      y <= sq.bottomRightY
    ) {
      return squareName;
    }
  }
  return null;
}
