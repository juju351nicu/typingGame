let _database;
/**
 * IndexedDBに接続する
 * @returns 非同期処理の結果
 */
const getDatabase = async () => {
  const promise = new Promise((resolve, reject) => {
    if (_database != undefined) {
      resolve(_database);
    } else {
      const request = window.indexedDB.open("asyncdb", 1);
      request.onupgradeneeded = (event) => {
        const target = event.target;
        const database = target.result;
        database.createObjectStore("members", {
          keyPath: "id", // ここで与えたものを主キーとして...
          autoIncrement: true, // auto incrementalな挙動をする
        });
      };
      request.onsuccess = (event) => {
        const target = event.target;
        _database = target.result;
        resolve(_database);
      };
      request.onerror = (event) => {
        console.log("ERROR: DBをオープンできません。", event);
        reject(new Error("ERROR: DBをオープンできません。"));
      };
    }
  });
  return promise;
};

export default {
  getDatabase,
};
