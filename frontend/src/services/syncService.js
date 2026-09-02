import API from "./api";
import {
  getUnsyncedProgress,
  deleteOfflineProgress,
} from "./offlineStorage";

export const syncOfflineProgress = async () => {
  try {
    if (!navigator.onLine) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      console.log("No login token. Offline progress will remain stored.");
      return;
    }

    const pendingProgress = await getUnsyncedProgress();

    if (pendingProgress.length === 0) {
      console.log("No offline progress to sync.");
      return;
    }

    console.log(
      `🔄 Syncing ${pendingProgress.length} offline progress record(s)...`
    );

    for (const progress of pendingProgress) {
      try {
        await API.post(
          "/progress",
          {
            lesson: progress.lesson,
            score: progress.score,
            totalQuestions: progress.totalQuestions,
            percentage: progress.percentage,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        await deleteOfflineProgress(progress.id);

        console.log(
          `✅ Progress synced for lesson: ${progress.lesson}`
        );
      } catch (error) {
        console.log(
          "❌ Failed to sync progress:",
          error.response?.data || error.message
        );
      }
    }

    console.log("🔄 Offline progress sync completed.");
  } catch (error) {
    console.log("Offline Sync Error:", error);
  }
};