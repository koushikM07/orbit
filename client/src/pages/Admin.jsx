import { useEffect, useState } from "react";
import { Trash2, Shield, User } from "lucide-react";

function Admin() {

  const [user, setUser] = useState(null);

  const [stats, setStats] = useState({
    users: 0,
    discussions: 0,
    comments: 0,
    likes: 0,
  });

  const [users, setUsers] = useState([]);

  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);


  // ==========================================
  // GET JWT
  // ==========================================

  const getToken = () => {
    return localStorage.getItem("orbitToken");
  };


  // ==========================================
  // AUTH HEADERS
  // ==========================================

  const getAuthHeaders = () => {

    const token = getToken();

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

  };


  // ==========================================
  // LOAD ADMIN
  // ==========================================

  useEffect(() => {

    const storedUser =
      localStorage.getItem("orbitUser");

    if (!storedUser) {
      return;
    }

    try {

      const adminUser =
        JSON.parse(storedUser);

      setUser(adminUser);

      fetchStats();
      fetchUsers();

    } catch (error) {

      console.error(
        "Invalid stored user:",
        error
      );

    }

  }, []);


  // ==========================================
  // FETCH STATS
  // ==========================================

  const fetchStats = async () => {

    try {

      const response = await fetch(
        "http://localhost:5000/api/admin/stats",
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {

        throw new Error(
          data.message ||
          "Failed to load statistics."
        );

      }

      if (data.success) {
        setStats(data.stats);
      }

    } catch (error) {

      console.error(
        "Stats error:",
        error
      );

    } finally {

      setLoadingStats(false);

    }

  };


  // ==========================================
  // FETCH USERS
  // ==========================================

  const fetchUsers = async () => {

    try {

      const response = await fetch(
        "http://localhost:5000/api/admin/users",
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {

        throw new Error(
          data.message ||
          "Failed to load users."
        );

      }

      if (data.success) {
        setUsers(data.users);
      }

    } catch (error) {

      console.error(
        "Users error:",
        error
      );

    } finally {

      setLoadingUsers(false);

    }

  };


  // ==========================================
  // DELETE USER
  // ==========================================

  const handleDeleteUser = async (selectedUser) => {

    if (selectedUser.role === "ADMIN") {

      alert(
        "Admin accounts cannot be deleted."
      );

      return;
    }


    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedUser.name}?`
    );

    if (!confirmed) {
      return;
    }


    try {

      const response = await fetch(
        `http://localhost:5000/api/admin/users/${selectedUser.id}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      const data =
        await response.json();


      if (!response.ok) {

        alert(
          data.message ||
          "Failed to delete user."
        );

        return;
      }


      // Remove user from UI

      setUsers((currentUsers) =>
        currentUsers.filter(
          (item) =>
            item.id !== selectedUser.id
        )
      );


      // Update statistics

      setStats((currentStats) => ({
        ...currentStats,
        users: Math.max(
          0,
          currentStats.users - 1
        ),
      }));


      alert(
        "User deleted successfully."
      );

    } catch (error) {

      console.error(
        "Delete user error:",
        error
      );

      alert(
        "Server is not responding."
      );

    }

  };


  // ==========================================
  // PAGE
  // ==========================================

  return (

    <div className="min-h-screen bg-slate-950 text-white">

      <div className="max-w-7xl mx-auto px-6 py-10">


        {/* HEADER */}

        <div className="flex justify-between items-center">

          <div>

            <p className="text-orange-500 font-semibold tracking-widest text-sm">
              ORBIT ADMIN
            </p>

            <h1 className="text-4xl font-bold mt-2">
              Admin Dashboard
            </h1>

            <p className="text-slate-400 mt-2">
              Manage your Orbit community.
            </p>

          </div>


          <div className="bg-slate-900 border border-slate-800 rounded-2xl px-5 py-3">

            <p className="text-sm text-slate-400">
              Logged in as
            </p>

            <p className="font-semibold">
              🛡️ {user?.name || "Orbit Admin"}
            </p>

          </div>

        </div>


        {/* ======================================
            STATISTICS
        ====================================== */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">


          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

            <p className="text-slate-400">
              👥 Total Users
            </p>

            <p className="text-3xl font-bold mt-3">
              {loadingStats
                ? "..."
                : stats.users}
            </p>

          </div>


          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

            <p className="text-slate-400">
              🎬 Discussions
            </p>

            <p className="text-3xl font-bold mt-3">
              {loadingStats
                ? "..."
                : stats.discussions}
            </p>

          </div>


          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

            <p className="text-slate-400">
              💬 Comments
            </p>

            <p className="text-3xl font-bold mt-3">
              {loadingStats
                ? "..."
                : stats.comments}
            </p>

          </div>


          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

            <p className="text-slate-400">
              ❤️ Likes
            </p>

            <p className="text-3xl font-bold mt-3">
              {loadingStats
                ? "..."
                : stats.likes}
            </p>

          </div>

        </div>


        {/* ======================================
            USERS
        ====================================== */}

        <div className="mt-12">

          <div className="flex justify-between items-center mb-6">

            <div>

              <h2 className="text-2xl font-bold">
                👥 Manage Users
              </h2>

              <p className="text-slate-400 mt-1">
                View and manage Orbit members.
              </p>

            </div>

            <span className="bg-slate-800 px-4 py-2 rounded-xl text-sm text-slate-300">
              {users.length} users
            </span>

          </div>


          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

            {loadingUsers ? (

              <div className="p-8 text-center text-slate-400">
                Loading users...
              </div>

            ) : users.length === 0 ? (

              <div className="p-8 text-center text-slate-400">
                No users found.
              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead className="bg-slate-800">

                    <tr>

                      <th className="text-left px-6 py-4 text-sm text-slate-400">
                        User
                      </th>

                      <th className="text-left px-6 py-4 text-sm text-slate-400">
                        Email
                      </th>

                      <th className="text-left px-6 py-4 text-sm text-slate-400">
                        Role
                      </th>

                      <th className="text-left px-6 py-4 text-sm text-slate-400">
                        Joined
                      </th>

                      <th className="text-right px-6 py-4 text-sm text-slate-400">
                        Action
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {users.map((item) => (

                      <tr
                        key={item.id}
                        className="border-t border-slate-800 hover:bg-slate-800/50 transition"
                      >

                        <td className="px-6 py-4">

                          <div className="flex items-center gap-3">

                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">

                              {item.role === "ADMIN"
                                ? (
                                  <Shield
                                    size={18}
                                    className="text-orange-500"
                                  />
                                )
                                : (
                                  <User
                                    size={18}
                                    className="text-slate-400"
                                  />
                                )
                              }

                            </div>

                            <div>

                              <p className="font-semibold">
                                {item.name}
                              </p>

                              <p className="text-xs text-slate-500">
                                ID #{item.id}
                              </p>

                            </div>

                          </div>

                        </td>


                        <td className="px-6 py-4 text-slate-400">
                          {item.email}
                        </td>


                        <td className="px-6 py-4">

                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                              item.role === "ADMIN"
                                ? "bg-orange-500/20 text-orange-400"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {item.role}
                          </span>

                        </td>


                        <td className="px-6 py-4 text-slate-400 text-sm">
                          {item.created_at || "—"}
                        </td>


                        <td className="px-6 py-4 text-right">

                          {item.role === "ADMIN" ? (

                            <span className="text-xs text-slate-500">
                              Protected
                            </span>

                          ) : (

                            <button
                              onClick={() =>
                                handleDeleteUser(item)
                              }
                              className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-800 transition"
                              title="Delete user"
                            >
                              <Trash2 size={18} />
                            </button>

                          )}

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </div>


        {/* FUTURE FEATURES */}

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5">

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

            <h3 className="text-xl font-semibold">
              🎬 Discussion Moderation
            </h3>

            <p className="text-slate-400 mt-2">
              Review and moderate community
              discussions.
            </p>

            <p className="text-orange-500 text-sm mt-4">
              Coming next
            </p>

          </div>


          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

            <h3 className="text-xl font-semibold">
              💬 Comment Moderation
            </h3>

            <p className="text-slate-400 mt-2">
              Review and manage community
              comments.
            </p>

            <p className="text-orange-500 text-sm mt-4">
              Coming next
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Admin;