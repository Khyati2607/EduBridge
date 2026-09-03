import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function SwitchAccount() {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    const savedAccounts = JSON.parse(
      localStorage.getItem("eduBridgeAccounts") || "[]"
    );

    setAccounts(savedAccounts);
  }, []);

  const switchAccount = (account) => {
    if (!account.token) {
      alert(
        "This account needs to login again."
      );

      navigate("/login");
      return;
    }

    /* Restore selected account */

    localStorage.setItem(
      "token",
      account.token
    );

    localStorage.setItem(
      "userId",
      account.id
    );

    localStorage.setItem(
      "userName",
      account.name
    );

    localStorage.setItem(
      "userEmail",
      account.email
    );

    localStorage.setItem(
      "offlineUser",
      "true"
    );

    localStorage.setItem(
      "offlineEmail",
      account.email
    );

    localStorage.setItem(
      "selectedAccountId",
      account.id
    );

    /* Instant switch */
    navigate("/dashboard", {
      replace: true,
    });
  };

  const addAccount = () => {
    /*
      Clear only current session.
      Remembered accounts remain untouched.
    */

    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("offlineUser");
    localStorage.removeItem("offlineEmail");

    navigate("/login");
  };

  const removeAccount = (id) => {
    const currentUserId =
      localStorage.getItem("userId");

    if (id === currentUserId) {
      alert(
        "You cannot remove the account currently in use."
      );
      return;
    }

    const updatedAccounts =
      accounts.filter(
        (account) => account.id !== id
      );

    setAccounts(updatedAccounts);

    localStorage.setItem(
      "eduBridgeAccounts",
      JSON.stringify(updatedAccounts)
    );
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-6">

      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-lg">

        <h1 className="text-3xl font-bold text-green-700 text-center">
          Switch Account
        </h1>

        <p className="text-gray-500 text-center mt-2">
          Choose an account to continue
        </p>

        <div className="mt-8 space-y-4">

          {accounts.map((account) => {
            const currentUserId =
              localStorage.getItem(
                "userId"
              );

            const isCurrent =
              account.id ===
              currentUserId;

            return (
              <div
                key={account.id}
                className={`border rounded-2xl p-4 flex items-center gap-4 transition ${
                  isCurrent
                    ? "bg-green-50 border-green-400"
                    : "hover:bg-green-50"
                }`}
              >

                <button
                  onClick={() =>
                    switchAccount(
                      account
                    )
                  }
                  className="flex items-center gap-4 flex-1 text-left"
                >

                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xl">
                    {account.name
                      ?.charAt(0)
                      .toUpperCase() ||
                      "S"}
                  </div>

                  <div>

                    <div className="flex items-center gap-2">

                      <p className="font-semibold text-gray-800">
                        {account.name}
                      </p>

                      {isCurrent && (
                        <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                          Current
                        </span>
                      )}

                    </div>

                    <p className="text-sm text-gray-500">
                      {account.email}
                    </p>

                  </div>

                </button>

                {!isCurrent && (
                  <button
                    onClick={() =>
                      removeAccount(
                        account.id
                      )
                    }
                    className="text-red-500 hover:text-red-700 font-medium"
                  >
                    Remove
                  </button>
                )}

              </div>
            );
          })}

          <button
            onClick={addAccount}
            className="w-full border-2 border-dashed border-green-400 text-green-700 py-4 rounded-2xl font-semibold hover:bg-green-50 transition"
          >
            ＋ Add Another Account
          </button>

        </div>

        <button
          onClick={() =>
            navigate("/dashboard")
          }
          className="mt-6 w-full bg-gray-200 hover:bg-gray-300 py-3 rounded-xl font-semibold"
        >
          Cancel
        </button>

      </div>

    </div>
  );
}

export default SwitchAccount;