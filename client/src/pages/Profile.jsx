import { useEffect, useState } from "react";

import {
  User,
  Mail,
  Calendar,
  Film,
  MessageCircle,
  Heart,
  Shield,
  Pencil,
  Save,
  X,
} from "lucide-react";

import { Link } from "react-router-dom";


function Profile() {

  // =====================================================
  // STATE
  // =====================================================

  const [profile, setProfile] =
    useState(null);

  const [discussions, setDiscussions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [editing, setEditing] =
    useState(false);

  const [name, setName] =
    useState("");

  const [avatarUrl, setAvatarUrl] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");


  const API_BASE =
    "http://localhost:5000/api";


  // =====================================================
  // LOAD PROFILE
  // =====================================================

  const loadProfile = async () => {

    try {

      setLoading(true);

      setError("");


      const token =
        localStorage.getItem(
          "orbitToken"
        );


      // -----------------------------------------------
      // NO TOKEN
      // -----------------------------------------------

      if (!token) {

        setError(
          "Please login to view your profile."
        );

        return;

      }


      const headers = {

        Authorization:
          `Bearer ${token}`

      };


      // =================================================
      // PROFILE API
      // =================================================

      const profileResponse =
        await fetch(
          `${API_BASE}/users/me`,
          {
            headers
          }
        );


      const profileData =
        await profileResponse.json();


      if (
        !profileResponse.ok
      ) {

        throw new Error(
          profileData.message ||
          "Failed to load profile."
        );

      }


      // =================================================
      // DISCUSSIONS API
      // =================================================

      const discussionsResponse =
        await fetch(
          `${API_BASE}/users/me/discussions`,
          {
            headers
          }
        );


      const discussionsData =
        await discussionsResponse.json();


      if (
        !discussionsResponse.ok
      ) {

        throw new Error(
          discussionsData.message ||
          "Failed to load discussions."
        );

      }


      // =================================================
      // SAVE DATA
      // =================================================

      setProfile(
        profileData
      );


      setDiscussions(
        discussionsData.discussions || []
      );


      // =================================================
      // SET EDIT FORM VALUES
      // =================================================

      setName(
        profileData.user.name || ""
      );


      setAvatarUrl(
        profileData.user.avatarUrl || ""
      );


    } catch (error) {

      console.error(
        "PROFILE ERROR:",
        error
      );


      setError(
        error.message ||
        "Something went wrong."
      );


    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // LOAD ON PAGE OPEN
  // =====================================================

  useEffect(() => {

    loadProfile();

  }, []);


  // =====================================================
  // OPEN EDIT MODE
  // =====================================================

  const handleEdit = () => {

    setName(
      profile?.user?.name || ""
    );

    setAvatarUrl(
      profile?.user?.avatarUrl || ""
    );

    setMessage("");

    setEditing(true);

  };


  // =====================================================
  // CANCEL EDIT
  // =====================================================

  const handleCancel = () => {

    setName(
      profile?.user?.name || ""
    );

    setAvatarUrl(
      profile?.user?.avatarUrl || ""
    );

    setMessage("");

    setEditing(false);

  };


  // =====================================================
  // SAVE PROFILE
  // =====================================================

  const handleSave = async () => {

    // -----------------------------------------------
    // NAME VALIDATION
    // -----------------------------------------------

    if (
      !name.trim()
    ) {

      setMessage(
        "Name cannot be empty."
      );

      return;

    }


    try {

      setSaving(true);

      setMessage("");


      const token =
        localStorage.getItem(
          "orbitToken"
        );


      // =================================================
      // UPDATE API
      // =================================================

      const response =
        await fetch(
          `${API_BASE}/users/me`,
          {

            method: "PUT",

            headers: {

              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`

            },

            body: JSON.stringify({

              name:
                name.trim(),

              avatarUrl:
                avatarUrl.trim()

            })

          }
        );


      const data =
        await response.json();


      if (
        !response.ok
      ) {

        throw new Error(
          data.message ||
          "Failed to update profile."
        );

      }


      // =================================================
      // UPDATE PROFILE STATE
      // =================================================

      setProfile(
        (current) => ({

          ...current,

          user:
            data.user

        })
      );


      // =================================================
      // UPDATE LOCAL STORAGE
      // =================================================

      const storedUser =
        localStorage.getItem(
          "orbitUser"
        );


      if (storedUser) {

        try {

          const oldUser =
            JSON.parse(
              storedUser
            );


          const updatedUser = {

            ...oldUser,

            name:
              data.user.name,

            avatarUrl:
              data.user.avatarUrl

          };


          localStorage.setItem(

            "orbitUser",

            JSON.stringify(
              updatedUser
            )

          );

        } catch (error) {

          console.error(
            "LOCAL USER UPDATE ERROR:",
            error
          );

        }

      }


      // =================================================
      // CLOSE EDIT MODE
      // =================================================

      setEditing(false);

      setMessage(
        "Profile updated successfully!"
      );


    } catch (error) {

      console.error(
        "SAVE PROFILE ERROR:",
        error
      );


      setMessage(
        error.message ||
        "Failed to update profile."
      );


    } finally {

      setSaving(false);

    }

  };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">

        <p className="text-slate-400">
          Loading your Orbit profile...
        </p>

      </div>

    );

  }


  // =====================================================
  // ERROR
  // =====================================================

  if (error) {

    return (

      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">

        <div className="text-center">

          <p className="text-red-400 mb-5">
            {error}
          </p>


          <Link
            to="/login"
            className="inline-block bg-orange-500 hover:bg-orange-600 px-5 py-3 rounded-xl font-semibold transition"
          >
            Go to Login
          </Link>

        </div>

      </div>

    );

  }


  const user =
    profile?.user;

  const stats =
    profile?.stats;


  // =====================================================
  // MAIN PAGE
  // =====================================================

  return (

    <div className="min-h-screen bg-slate-950 text-white">

      <div className="max-w-6xl mx-auto px-6 py-12">


        {/* =================================================
            PROFILE CARD
        ================================================= */}

        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">


          {/* =================================================
              COVER
          ================================================= */}

          <div className="h-36 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-400" />


          <div className="px-8 pb-8">


            {/* =================================================
                AVATAR + BASIC INFO
            ================================================= */}

            <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-14">


              {/* =================================================
                  AVATAR
              ================================================= */}

              <div className="w-28 h-28 rounded-full bg-slate-800 border-4 border-slate-900 overflow-hidden flex items-center justify-center shadow-xl flex-shrink-0">

                {user?.avatarUrl ? (

                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />

                ) : (

                  <User
                    size={48}
                    className="text-orange-500"
                  />

                )}

              </div>


              {/* =================================================
                  USER INFORMATION
              ================================================= */}

              <div className="flex-1 pt-3">

                <div className="flex flex-wrap items-center gap-3">

                  <h1 className="text-4xl font-bold">
                    {user?.name}
                  </h1>


                  {user?.role === "ADMIN" && (

                    <span className="flex items-center gap-1 bg-orange-500/10 text-orange-400 px-3 py-1 rounded-full text-sm">

                      <Shield size={14} />

                      Admin

                    </span>

                  )}

                </div>


                <div className="flex flex-wrap gap-5 mt-3 text-slate-400 text-sm">

                  <span className="flex items-center gap-2">

                    <Mail size={15} />

                    {user?.email}

                  </span>


                  <span className="flex items-center gap-2">

                    <Calendar size={15} />

                    Joined{" "}

                    {user?.createdAt
                      ? new Date(
                          user.createdAt
                        ).toLocaleDateString()
                      : "Orbit"}

                  </span>

                </div>

              </div>


              {/* =================================================
                  EDIT BUTTON
              ================================================= */}

              {!editing && (

                <button
                  onClick={handleEdit}
                  className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 px-5 py-3 rounded-xl transition"
                >

                  <Pencil size={18} />

                  Edit Profile

                </button>

              )}

            </div>


            {/* =================================================
                EDIT PROFILE PANEL
            ================================================= */}

            {editing && (

              <div className="mt-8 pt-8 border-t border-slate-800">

                <div className="flex items-center justify-between mb-6">

                  <div>

                    <h2 className="text-2xl font-bold">
                      Edit Profile
                    </h2>

                    <p className="text-slate-400 text-sm mt-1">
                      Update your Orbit profile information.
                    </p>

                  </div>


                  <button
                    onClick={handleCancel}
                    className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                  >

                    <X size={20} />

                  </button>

                </div>


                <div className="max-w-2xl space-y-6">


                  {/* =================================================
                      NAME
                  ================================================= */}

                  <div>

                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Display Name
                    </label>


                    <input
                      type="text"
                      value={name}
                      maxLength={50}
                      onChange={(e) =>
                        setName(
                          e.target.value
                        )
                      }
                      placeholder="Your name"
                      className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-orange-500 transition"
                    />


                    <p className="text-xs text-slate-500 mt-2">
                      Maximum 50 characters.
                    </p>

                  </div>


                  {/* =================================================
                      AVATAR URL
                  ================================================= */}

                  <div>

                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Profile Picture URL
                    </label>


                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) =>
                        setAvatarUrl(
                          e.target.value
                        )
                      }
                      placeholder="https://example.com/avatar.jpg"
                      className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-orange-500 transition"
                    />


                    <p className="text-xs text-slate-500 mt-2">
                      Paste a public image URL. Direct image upload will be added later.
                    </p>

                  </div>


                  {/* =================================================
                      AVATAR PREVIEW
                  ================================================= */}

                  {avatarUrl.trim() && (

                    <div>

                      <p className="text-sm text-slate-400 mb-2">
                        Preview
                      </p>


                      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-orange-500 bg-slate-800">

                        <img
                          src={avatarUrl}
                          alt="Avatar preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display =
                              "none";
                          }}
                        />

                      </div>

                    </div>

                  )}


                  {/* =================================================
                      BUTTONS
                  ================================================= */}

                  <div className="flex gap-3">


                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 px-6 py-3 rounded-xl font-semibold transition"
                    >

                      <Save size={18} />

                      {saving
                        ? "Saving..."
                        : "Save Changes"}

                    </button>


                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 px-6 py-3 rounded-xl font-semibold transition"
                    >

                      <X size={18} />

                      Cancel

                    </button>

                  </div>


                  {/* =================================================
                      MESSAGE
                  ================================================= */}

                  {message && (

                    <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-300">
                      {message}
                    </div>

                  )}

                </div>

              </div>

            )}


            {/* =================================================
                SUCCESS MESSAGE
            ================================================= */}

            {!editing && message && (

              <div className="mt-5 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-sm text-green-400">
                {message}
              </div>

            )}

          </div>

        </div>


        {/* =================================================
            STATS
        ================================================= */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">


          {/* DISCUSSIONS */}

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-slate-400">
                  Discussions
                </p>

                <p className="text-3xl font-bold mt-2">
                  {stats?.discussions || 0}
                </p>

              </div>


              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">

                <Film
                  size={24}
                  className="text-orange-500"
                />

              </div>

            </div>

          </div>


          {/* COMMENTS */}

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-slate-400">
                  Comments
                </p>

                <p className="text-3xl font-bold mt-2">
                  {stats?.comments || 0}
                </p>

              </div>


              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">

                <MessageCircle
                  size={24}
                  className="text-blue-400"
                />

              </div>

            </div>

          </div>


          {/* LIKES */}

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-slate-400">
                  Likes Received
                </p>

                <p className="text-3xl font-bold mt-2">
                  {stats?.likesReceived || 0}
                </p>

              </div>


              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">

                <Heart
                  size={24}
                  className="text-red-500"
                  fill="currentColor"
                />

              </div>

            </div>

          </div>

        </div>


        {/* =================================================
            MY DISCUSSIONS
        ================================================= */}

        <div className="mt-12">


          <div className="flex items-center justify-between mb-6">

            <h2 className="text-2xl font-bold">
              🎬 My Discussions
            </h2>


            <Link
              to="/movies"
              className="text-orange-500 hover:text-orange-400 transition"
            >
              Go to Movies →
            </Link>

          </div>


          {discussions.length === 0 ? (

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">

              <p className="text-slate-400">
                You haven't created any discussions yet.
              </p>


              <Link
                to="/movies"
                className="inline-block mt-4 bg-orange-500 hover:bg-orange-600 px-5 py-3 rounded-xl font-semibold transition"
              >
                Start a Discussion
              </Link>

            </div>

          ) : (

            <div className="space-y-5">

              {discussions.map(
                (discussion) => (

                  <div
                    key={discussion.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-orange-500 transition"
                  >

                    <div className="flex items-center justify-between">

                      <span className="text-orange-500 text-sm font-semibold">
                        {discussion.type}
                      </span>


                      <span className="text-slate-500 text-sm">

                        {discussion.created_at
                          ? new Date(
                              discussion.created_at
                            ).toLocaleDateString()
                          : ""}

                      </span>

                    </div>


                    <h3 className="text-xl font-semibold mt-3">
                      {discussion.title}
                    </h3>


                    <p className="text-slate-400 mt-2">
                      {discussion.description}
                    </p>


                    <div className="flex gap-5 mt-5 text-slate-400 text-sm">

                      <span className="flex items-center gap-1">

                        <Heart size={15} />

                        {discussion.likes || 0}

                      </span>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

      </div>

    </div>

  );

}


export default Profile;