const DB_NAME = "EduBridgeDB";
const DB_VERSION = 2;

const LESSON_STORE = "lessons";
const QUIZ_STORE = "quizzes";
const PROGRESS_STORE = "offlineProgress";

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(LESSON_STORE)) {
        db.createObjectStore(LESSON_STORE, {
          keyPath: "_id",
        });
      }

      if (!db.objectStoreNames.contains(QUIZ_STORE)) {
        db.createObjectStore(QUIZ_STORE, {
          keyPath: "lessonId",
        });
      }

      if (!db.objectStoreNames.contains(PROGRESS_STORE)) {
        db.createObjectStore(PROGRESS_STORE, {
          keyPath: "id",
        });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

/* ================= LESSONS ================= */

export const saveLessonOffline = async (lesson) => {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(LESSON_STORE, "readwrite");

      transaction.objectStore(LESSON_STORE).put(lesson);

      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.log("Offline Save Error:", error);
    return false;
  }
};

export const getOfflineLesson = async (lessonId) => {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const request = db
        .transaction(LESSON_STORE, "readonly")
        .objectStore(LESSON_STORE)
        .get(lessonId);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.log("Offline Fetch Error:", error);
    return null;
  }
};

export const getAllOfflineLessons = async () => {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const request = db
        .transaction(LESSON_STORE, "readonly")
        .objectStore(LESSON_STORE)
        .getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.log("Offline Lessons Error:", error);
    return [];
  }
};

export const deleteOfflineLesson = async (lessonId) => {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(LESSON_STORE, "readwrite");

      transaction.objectStore(LESSON_STORE).delete(lessonId);

      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.log("Offline Delete Error:", error);
    return false;
  }
};

/* ================= QUIZZES ================= */

export const saveQuizOffline = async (lessonId, quiz) => {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(QUIZ_STORE, "readwrite");

      transaction.objectStore(QUIZ_STORE).put({
        lessonId,
        quiz,
      });

      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.log("Offline Quiz Save Error:", error);
    return false;
  }
};

export const getOfflineQuiz = async (lessonId) => {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const request = db
        .transaction(QUIZ_STORE, "readonly")
        .objectStore(QUIZ_STORE)
        .get(lessonId);

      request.onsuccess = () => {
        resolve(request.result?.quiz || null);
      };

      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.log("Offline Quiz Fetch Error:", error);
    return null;
  }
};

/* ================= OFFLINE PROGRESS ================= */

export const saveOfflineProgress = async (progress) => {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        PROGRESS_STORE,
        "readwrite"
      );

      transaction.objectStore(PROGRESS_STORE).put({
        ...progress,
        id: `${progress.lesson}-${Date.now()}`,
        synced: false,
      });

      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.log("Offline Progress Save Error:", error);
    return false;
  }
};

export const getOfflineProgress = async () => {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const request = db
        .transaction(PROGRESS_STORE, "readonly")
        .objectStore(PROGRESS_STORE)
        .getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.log("Offline Progress Error:", error);
    return [];
  }
};

/* ================= SYNC HELPERS ================= */

export const getUnsyncedProgress = async () => {
  try {
    const progress = await getOfflineProgress();

    return progress.filter(
      (item) => item.synced === false
    );
  } catch (error) {
    console.log("Unsynced Progress Error:", error);
    return [];
  }
};

export const deleteOfflineProgress = async (id) => {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        PROGRESS_STORE,
        "readwrite"
      );

      transaction.objectStore(PROGRESS_STORE).delete(id);

      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.log("Delete Offline Progress Error:", error);
    return false;
  }
};