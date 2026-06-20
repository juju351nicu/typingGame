/**
 * 画面幅に応じた風船の想定幅を取得する。
 *
 * @param boardWidth 単語表示エリアの横幅
 * @param defaultWidth PC幅で使用する風船幅
 * @returns レスポンシブ調整後の風船幅
 */
export const getResponsiveBalloonWidth = (
  boardWidth: number | undefined,
  defaultWidth: number
): number => {
  // 狭い画面では風船を小さめに見積もり、右端にはみ出しにくくする。
  if (boardWidth !== undefined && boardWidth <= 480) {
    return 120;
  }
  if (boardWidth !== undefined && boardWidth <= 760) {
    return 140;
  }
  return defaultWidth;
};

/**
 * 単語を表示する横位置を生成する。
 *
 * 風船が表示エリアの右端からはみ出しにくいよう、表示エリア幅から風船幅を
 * 引いた範囲でランダムな位置を返す。
 *
 * @param boardWidth 単語表示エリアの横幅
 * @param balloonWidth 風船の想定幅
 * @param random ランダム値を返す関数
 * @returns 表示開始位置の横座標
 */
export const getRandomWordLeft = (
  boardWidth: number | undefined,
  balloonWidth: number,
  random = Math.random
): number => {
  if (boardWidth === undefined) {
    return 0;
  }

  // 風船幅が表示エリア以上でも、負の座標にならないようにする。
  const maxPosition = Math.max(boardWidth - balloonWidth, 0);
  return Math.floor(random() * maxPosition);
};
