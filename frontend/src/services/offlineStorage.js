const DB_NAME = "EduBridgeDB";
const DB_VERSION = 3;

const LESSON_STORE = "lessons";
const QUIZ_STORE = "quizzes";
const PROGRESS_STORE = "offlineProgress";

const getUserId = () => localStorage.getItem("userId");

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(LESSON_STORE)) {
        db.createObjectStore(LESSON_STORE, {
          keyPath: "id",
        });
      }

      if (!db.objectStoreNames.contains(QUIZ_STORE)) {
        db.createObjectStore(QUIZ_STORE, {
          keyPath: "id",
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
    const userId = getUserId();

    if (!userId) return false;

    const db = await openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(LESSON_STORE, "readwrite");

      transaction.objectStore(LESSON_STORE).put({
        ...lesson,
        id: `${userId}_${lesson._id}`,
        userId,
      });

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
    const userId = getUserId();

    if (!userId) return null;

    const db = await openDB();

    return new Promise((resolve, reject) => {
      const request = db
        .transaction(LESSON_STORE, "readonly")
        .objectStore(LESSON_STORE)
        .get(`${userId}_${lessonId}`);

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
    const userId = getUserId();

    if (!userId) return [];

    const db = await openDB();

    return new Promise((resolve, reject) => {
      const request = db
        .transaction(LESSON_STORE, "readonly")
        .objectStore(LESSON_STORE)
        .getAll();

      request.onsuccess = () => {
        const lessons = (request.result || []).filter(
          (lesson) => lesson.userId === userId
        );

        resolve(lessons);
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
    const userId = getUserId();

    if (!userId) return false;

    const db = await openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(LESSON_STORE, "readwrite");

      transaction
        .objectStore(LESSON_STORE)
        .delete(`${userId}_${lessonId}`);

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
    const userId = getUserId();

    if (!userId) return false;

    const db = await openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(QUIZ_STORE, "readwrite");

      transaction.objectStore(QUIZ_STORE).put({
        id: `${userId}_${lessonId}`,
        userId,
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
    const userId = getUserId();

    if (!userId) return null;

    const db = await openDB();

    return new Promise((resolve, reject) => {
      const request = db
        .transaction(QUIZ_STORE, "readonly")
        .objectStore(QUIZ_STORE)
        .get(`${userId}_${lessonId}`);

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

export const deleteOfflineQuiz = async (lessonId) => {
  try {
    const userId = getUserId();

    if (!userId) return false;

    const db = await openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(QUIZ_STORE, "readwrite");

      transaction
        .objectStore(QUIZ_STORE)
        .delete(`${userId}_${lessonId}`);

      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.log("Delete Offline Quiz Error:", error);
    return false;
  }
};

/* ================= OFFLINE PROGRESS ================= */

export const saveOfflineProgress = async (progress) => {
  try {
    const userId = getUserId();

    if (!userId) return false;

    const db = await openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        PROGRESS_STORE,
        "readwrite"
      );

      transaction.objectStore(PROGRESS_STORE).put({
        ...progress,
        id: `${userId}_${progress.lesson}_${Date.now()}`,
        userId,
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
    const userId = getUserId();

    if (!userId) return [];

    const db = await openDB();

    return new Promise((resolve, reject) => {
      const request = db
        .transaction(PROGRESS_STORE, "readonly")
        .objectStore(PROGRESS_STORE)
        .getAll();

      request.onsuccess = () => {
        const progress = (request.result || []).filter(
          (item) => item.userId === userId
        );

        resolve(progress);
      };

      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.log("Offline Progress Error:", error);
    return [];
  }
};

export const getUnsyncedProgress = async () => {
  const progress = await getOfflineProgress();

  return progress.filter(
    (item) => item.synced === false
  );
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

/* ================= CLEAR CURRENT USER DATA ================= */

export const clearAllOfflineData = async () => {
  try {
    const userId = getUserId();

    if (!userId) return false;

    const db = await openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        [
          LESSON_STORE,
          QUIZ_STORE,
          PROGRESS_STORE,
        ],
        "readwrite"
      );

      const lessons = transaction
        .objectStore(LESSON_STORE);

      const quizzes = transaction
        .objectStore(QUIZ_STORE);

      const progress = transaction
        .objectStore(PROGRESS_STORE);

      lessons.getAll().onsuccess = (event) => {
        event.target.result
          .filter((item) => item.userId === userId)
          .forEach((item) => lessons.delete(item.id));
      };

      quizzes.getAll().onsuccess = (event) => {
        event.target.result
          .filter((item) => item.userId === userId)
          .forEach((item) => quizzes.delete(item.id));
      };

      progress.getAll().onsuccess = (event) => {
        event.target.result
          .filter((item) => item.userId === userId)
          .forEach((item) => progress.delete(item.id));
      };

      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.log("Clear Offline Data Error:", error);
    return false;
  }
};