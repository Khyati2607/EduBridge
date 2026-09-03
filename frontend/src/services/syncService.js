import API from "./api";

import {
  getUnsyncedProgress,
  deleteOfflineProgress,
} from "./offlineStorage";

const getCurrentUserId = () =>
  localStorage.getItem("userId");

export const syncOfflineProgress =
  async () => {
    try {
      if (!navigator.onLine) {
        return;
      }

      const token =
        localStorage.getItem("token");

      const userId =
        getCurrentUserId();

      if (!token || !userId) {
        console.log(
          "No active account. Offline progress remains stored."
        );
        return;
      }

      const pendingProgress =
        await getUnsyncedProgress();

      if (
        pendingProgress.length === 0
      ) {
        console.log(
          "No offline progress to sync."
        );
        return;
      }

      console.log(
        `🔄 Syncing ${pendingProgress.length} progress record(s) for user ${userId}`
      );

      for (
        const progress of pendingProgress
      ) {
        /*
          Extra safety check:
          never sync a record belonging
          to another account.
        */

        if (
          progress.userId !== userId
        ) {
          console.log(
            "⚠️ Skipping progress belonging to another account."
          );
          continue;
        }

        try {
          const lessonId =
            progress.lesson?._id ||
            progress.lesson;

          if (!lessonId) {
            console.log(
              "⚠️ Skipping progress without lesson ID."
            );
            continue;
          }

          await API.post(
            "/progress",
            {
              lesson: lessonId,
              score:
                progress.score || 0,
              totalQuestions:
                progress.totalQuestions ||
                0,
              percentage:
                progress.percentage ||
                0,
            },
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

          await deleteOfflineProgress(
            progress.id
          );

          console.log(
            `✅ Synced lesson ${lessonId}`
          );
        } catch (error) {
          console.log(
            "❌ Failed to sync progress:",
            error.response?.data ||
              error.message
          );

          /*
            Keep the record locally.
            It will retry when internet
            is available again.
          */
        }
      }

      console.log(
        "✅ Offline sync completed."
      );
    } catch (error) {
      console.log(
        "Offline Sync Error:",
        error
      );
    }
  };