import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function SwitchAccount() {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(
      localStorage.getItem("eduBridgeAccounts") || "[]"
    );

    setAccounts(saved);
  }, []);

  const switchAccount = (account) => {
    localStorage.setItem(
      "selectedAccountId",
      account.id
    );

    navigate("/login");
  };

  const addAccount = () => {
    localStorage.removeItem("selectedAccountId");
    navigate("/login");
  };

  const removeAccount = (id) => {
    const updated = accounts.filter(
      (account) => account.id !== id
    );

    setAccounts(updated);

    localStorage.setItem(
      "eduBridgeAccounts",
      JSON.stringify(updated)
    );
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-lg">

        <h1 className="text-3xl font-bold text-green-700 text-center">
          Switch Account
        </h1>

        <p className="text-gray-500 text-center mt-2">
          Choose an EduBridge account
        </p>

        <div className="mt-8 space-y-4">

          {accounts.map((account) => (
            <div
              key={account.id}
              className="border rounded-2xl p-4 flex items-center justify-between hover:bg-green-50"
            >
              <button
                onClick={() => switchAccount(account)}
                className="flex items-center gap-4 text-left flex-1"
              >
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xl">
                  {account.name?.charAt(0).toUpperCase()}
                </div>

                <div>
                  <p className="font-semibold text-gray-800">
                    {account.name}
                  </p>

                  <p className="text-sm text-gray-500">
                    {account.email}
                  </p>
                </div>
              </button>

              <button
                onClick={() => removeAccount(account.id)}
                className="text-red-500 hover:text-red-700 px-3"
              >
                Remove
              </button>
            </div>
          ))}

          <button
            onClick={addAccount}
            className="w-full border-2 border-dashed border-green-400 text-green-700 py-4 rounded-2xl font-semibold hover:bg-green-50"
          >
            + Add Another Account
          </button>

        </div>

        <button
          onClick={() => navigate("/")}
          className="mt-6 w-full bg-gray-200 hover:bg-gray-300 py-3 rounded-xl font-semibold"
        >
          Cancel
        </button>

      </div>
    </div>
  );
}

export default SwitchAccount;