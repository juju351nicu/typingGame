/**
 * 値があるかどうか判定する。
 * リストの場合は空かどうかを判定する。
 * @param {string} target 値
 * @returns 判定結果
 */
const isEmpty = (target) => {
  return (
    target === null ||
    target === undefined ||
    ((typeof target === "string" || target instanceof Array) &&
      target.length <= 0)
  );
};

/**
 * 文字列のNull・空文字を判定する。
 *
 * @param {string} target 値
 * @returns 判定結果
 */
const isNullOrEmptyByString = (target) => {
  if (typeof target !== String) {
    return false;
  }
  return target === null || target === undefined || target === "";
};
/**
 * ブラウザがHTML5ローカルストレージをサポートしているかどうかを判断する
 */
const isLocalStorage = () => {
  try {
    if ("localStorage" in window && window["localStorage"] !== null) {
      console.log("ローカルストレージは使用可能です。");
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("error" + error);
    return false;
  }
};

/**
 * 何のブラウザかをチェックする
 */
const checkBrowser = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  if (userAgent.indexOf("msie") != -1 || userAgent.indexOf("trident") != -1) {
    console.log("Internet Explorerをお使いですね");
    return false;
  } else if (userAgent.indexOf("edge") != -1) {
    console.log("Edgeをお使いですね");
    return false;
  } else if (userAgent.indexOf("chrome") != -1) {
    console.log("Google Chromeをお使いですね");
    return true;
  } else if (userAgent.indexOf("safari") != -1) {
    console.log("Safariをお使いですね");
    return false;
  } else if (userAgent.indexOf("firefox") != -1) {
    console.log("FireFoxをお使いですね");
    return false;
  } else if (userAgent.indexOf("opera") != -1) {
    console.log("Operaをお使いですね");
    return false;
  } else {
    console.log("そんなブラウザは知らん");
    return false;
  }
};

/**
 * 計測時間を返却する。
 */
const getCountDownTime = (accumTime) => {
  // this.time is milliseconds
  const currentTime = accumTime;
  let milliseconds = currentTime % 1000;
  // 1秒 = 1000ミリ秒
  let seconds = Math.floor((currentTime / 1000) % 60);
  // 1分 = 60 * 1000ミリ秒
  let minutes = Math.floor((currentTime / (60 * 1000)) % 60);
  // 1時間 = 60 * 60 * 1000ミリ秒
  let hours = Math.floor(currentTime / (60 * 60 * 1000));

  let millisecondsMultiplyTen = Math.floor(milliseconds / 10);

  millisecondsMultiplyTen = ("0" + millisecondsMultiplyTen).slice(-2);
  seconds = ("0" + seconds).slice(-2);
  minutes = ("0" + minutes).slice(-2);
  hours = hours < 100 ? ("0" + hours).slice(-2) : hours;

  return `${hours}:${minutes}:${seconds}.${millisecondsMultiplyTen}`;
};

export default {
  isEmpty,
  isLocalStorage,
  checkBrowser,
  getCountDownTime,
};
