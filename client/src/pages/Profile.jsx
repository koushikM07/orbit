import {
    useEffect,
    useState
} from "react";

import {
    useParams,
    useNavigate
} from "react-router-dom";

import {
    Pencil,
    ArrowLeft,
    Heart,
    MessageCircle
} from "lucide-react";


function Profile() {

    const {
        orbitId
    } = useParams();


    const navigate =
        useNavigate();


    // =====================================================
    // PROFILE STATE
    // =====================================================

    const [user, setUser] =
        useState(null);


    const [stats, setStats] =
        useState({

            discussions: 0,

            comments: 0,

            likesReceived: 0

        });


    // =====================================================
    // DISCUSSION STATE
    // =====================================================

    const [discussions, setDiscussions] =
        useState([]);


    const [discussionsLoading,
        setDiscussionsLoading] =
        useState(true);


    // =====================================================
    // PAGE STATE
    // =====================================================

    const [loading, setLoading] =
        useState(true);


    const [error, setError] =
        useState("");


    // =====================================================
    // EDIT STATE
    // =====================================================

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


    // =====================================================
    // TOKEN
    // =====================================================

    const token =
        localStorage.getItem(
            "orbitToken"
        );


    // =====================================================
    // LOAD PROFILE
    // =====================================================

    const loadProfile =
        async () => {

            try {

                setLoading(true);

                setError("");


                let url;


                // =================================================
                // OTHER USER
                // =================================================

                if (orbitId) {

                    url =
                        `http://localhost:5000/api/users/orbit/${encodeURIComponent(
                            orbitId
                        )}`;

                }


                // =================================================
                // MY PROFILE
                // =================================================

                else {

                    url =
                        "http://localhost:5000/api/users/me";

                }


                const response =
                    await fetch(

                        url,

                        {

                            headers: {

                                Authorization:
                                    `Bearer ${token}`

                            }

                        }

                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(

                        data.message ||
                        "Failed to load profile."

                    );

                }


                setUser(
                    data.user
                );


                setStats(
                    data.stats || {

                        discussions: 0,

                        comments: 0,

                        likesReceived: 0

                    }
                );


                // =================================================
                // OWN PROFILE EDIT FIELDS
                // =================================================

                if (!orbitId) {

                    setName(
                        data.user.name || ""
                    );


                    setAvatarUrl(
                        data.user.avatarUrl || ""
                    );

                }


            } catch (error) {

                console.error(
                    "PROFILE ERROR:",
                    error
                );


                setError(
                    error.message ||
                    "Failed to load profile."
                );


            } finally {

                setLoading(false);

            }

        };


    // =====================================================
    // LOAD DISCUSSIONS
    // =====================================================

    const loadDiscussions =
        async () => {

            try {

                setDiscussionsLoading(
                    true
                );


                let url;


                // =================================================
                // OTHER USER
                // =================================================

                if (orbitId) {

                    url =
                        `http://localhost:5000/api/users/orbit/${encodeURIComponent(
                            orbitId
                        )}/discussions`;

                }


                // =================================================
                // MY PROFILE
                // =================================================

                else {

                    url =
                        "http://localhost:5000/api/users/me/discussions";

                }


                const response =
                    await fetch(

                        url,

                        {

                            headers: {

                                Authorization:
                                    `Bearer ${token}`

                            }

                        }

                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(

                        data.message ||
                        "Failed to load discussions."

                    );

                }


                setDiscussions(
                    data.discussions || []
                );


            } catch (error) {

                console.error(
                    "DISCUSSIONS ERROR:",
                    error
                );


                setDiscussions([]);

            } finally {

                setDiscussionsLoading(
                    false
                );

            }

        };


    // =====================================================
    // LOAD EVERYTHING
    // =====================================================

    useEffect(() => {

        if (!token) {

            navigate("/login");

            return;

        }


        const loadEverything =
            async () => {

                await loadProfile();

                await loadDiscussions();

            };


        loadEverything();

    }, [orbitId]);


    // =====================================================
    // UPDATE PROFILE
    // =====================================================

    const handleSave =
        async () => {

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


                const response =
                    await fetch(

                        "http://localhost:5000/api/users/me",

                        {

                            method:
                                "PUT",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                Authorization:
                                    `Bearer ${token}`

                            },

                            body:
                                JSON.stringify({

                                    name:
                                        name.trim(),

                                    avatarUrl:
                                        avatarUrl.trim()

                                })

                        }

                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    setMessage(

                        data.message ||
                        "Failed to update profile."

                    );

                    return;

                }


                setUser(
                    data.user
                );


                setName(
                    data.user.name
                );


                setAvatarUrl(
                    data.user.avatarUrl || ""
                );


                // =================================================
                // UPDATE LOCAL USER
                // =================================================

                const storedUser =
                    localStorage.getItem(
                        "orbitUser"
                    );


                if (storedUser) {

                    try {

                        const parsedUser =
                            JSON.parse(
                                storedUser
                            );


                        localStorage.setItem(

                            "orbitUser",

                            JSON.stringify({

                                ...parsedUser,

                                name:
                                    data.user.name,

                                orbitId:
                                    data.user.orbitId,

                                avatarUrl:
                                    data.user.avatarUrl

                            })

                        );


                    } catch {

                        // Ignore invalid local storage

                    }

                }


                setEditing(false);


                setMessage(
                    "Profile updated successfully!"
                );


            } catch (error) {

                console.error(
                    "UPDATE PROFILE ERROR:",
                    error
                );


                setMessage(
                    "Server is not responding."
                );


            } finally {

                setSaving(false);

            }

        };


    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate =
        (date) => {

            if (!date) {

                return "";

            }


            const value =
                new Date(date);


            if (
                Number.isNaN(
                    value.getTime()
                )
            ) {

                return date;

            }


            return value.toLocaleDateString(
                undefined,
                {
                    day:
                        "numeric",

                    month:
                        "long",

                    year:
                        "numeric"

                }
            );

        };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="min-h-screen bg-slate-950 flex items-center justify-center">

                <p className="text-slate-400">

                    Loading profile...

                </p>

            </div>

        );

    }


    // =====================================================
    // ERROR
    // =====================================================

    if (
        error ||
        !user
    ) {

        return (

            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-5">

                <p className="text-red-400">

                    {error ||
                        "User not found."}

                </p>


                <button

                    onClick={() =>
                        navigate(-1)
                    }

                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-3 rounded-xl"

                >

                    <ArrowLeft
                        size={18}
                    />

                    Go Back

                </button>

            </div>

        );

    }


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="min-h-screen bg-slate-950 text-white px-6 py-10">

            <div className="max-w-4xl mx-auto">


                {/* =================================================
                    BACK BUTTON
                ================================================= */}

                {orbitId && (

                    <button

                        onClick={() =>
                            navigate(-1)
                        }

                        className="flex items-center gap-2 text-slate-400 hover:text-white mb-6"

                    >

                        <ArrowLeft
                            size={18}
                        />

                        Back

                    </button>

                )}


                {/* =================================================
                    PROFILE CARD
                ================================================= */}

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">


                    {/* =================================================
                        HEADER
                    ================================================= */}

                    <div className="flex items-start justify-between gap-6">


                        <div className="flex items-center gap-5">


                            {/* =================================================
                                AVATAR
                            ================================================= */}

                            {user.avatarUrl ? (

                                <img

                                    src={
                                        user.avatarUrl
                                    }

                                    alt={
                                        user.name
                                    }

                                    className="w-24 h-24 rounded-full object-cover border-2 border-orange-500"

                                />

                            ) : (

                                <div className="w-24 h-24 rounded-full bg-orange-500 flex items-center justify-center text-3xl font-bold">

                                    {user.name
                                        ?.charAt(0)
                                        ?.toUpperCase()}

                                </div>

                            )}


                            {/* =================================================
                                USER INFO
                            ================================================= */}

                            <div>

                                <h1 className="text-3xl font-bold">

                                    {user.name}

                                </h1>


                                <p className="text-orange-400 font-medium mt-1">

                                    @{user.orbitId}

                                </p>


                                <p className="text-slate-500 text-sm mt-1">

                                    {user.role}

                                </p>


                                <p className="text-slate-500 text-sm mt-2">

                                    Joined{" "}

                                    {formatDate(
                                        user.createdAt
                                    )}

                                </p>

                            </div>

                        </div>


                        {/* =================================================
                            EDIT BUTTON
                        ================================================= */}

                        {!orbitId && (

                            <button

                                onClick={() =>
                                    setEditing(
                                        !editing
                                    )
                                }

                                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-5 py-3 rounded-xl"

                            >

                                <Pencil
                                    size={18}
                                />

                                Edit

                            </button>

                        )}

                    </div>


                    {/* =================================================
                        EMAIL
                    ================================================= */}

                    {!orbitId && user.email && (

                        <div className="mt-8 border-t border-slate-800 pt-6">

                            <p className="text-sm text-slate-500">

                                Email

                            </p>

                            <p className="text-slate-200 text-lg mt-1">

                                {user.email}

                            </p>

                        </div>

                    )}


                    {/* =================================================
                        EDIT FORM
                    ================================================= */}

                    {!orbitId && editing && (

                        <div className="mt-8 border-t border-slate-800 pt-6 space-y-4">


                            <div>

                                <label className="block text-sm text-slate-400 mb-2">

                                    Name

                                </label>


                                <input

                                    value={
                                        name
                                    }

                                    onChange={(e) =>
                                        setName(
                                            e.target.value
                                        )
                                    }

                                    maxLength={50}

                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500"

                                />

                            </div>


                            <div>

                                <label className="block text-sm text-slate-400 mb-2">

                                    Avatar URL

                                </label>


                                <input

                                    value={
                                        avatarUrl
                                    }

                                    onChange={(e) =>
                                        setAvatarUrl(
                                            e.target.value
                                        )
                                    }

                                    placeholder="https://..."

                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500"

                                />

                            </div>


                            {message && (

                                <p className="text-orange-400">

                                    {message}

                                </p>

                            )}


                            <div className="flex gap-3">


                                <button

                                    onClick={
                                        handleSave
                                    }

                                    disabled={
                                        saving
                                    }

                                    className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 px-5 py-3 rounded-xl font-semibold"

                                >

                                    {saving
                                        ? "Saving..."
                                        : "Save Changes"}

                                </button>


                                <button

                                    onClick={() => {

                                        setEditing(
                                            false
                                        );

                                        setMessage(
                                            ""
                                        );

                                    }}

                                    className="bg-slate-800 hover:bg-slate-700 px-5 py-3 rounded-xl"

                                >

                                    Cancel

                                </button>

                            </div>

                        </div>

                    )}


                    {/* =================================================
                        STATS
                    ================================================= */}

                    <div className="grid grid-cols-3 gap-4 mt-8">


                        {/* DISCUSSIONS */}

                        <div className="bg-slate-800 rounded-2xl p-5 text-center">

                            <div className="flex justify-center mb-2">

                                <MessageCircle
                                    size={22}
                                    className="text-orange-400"
                                />

                            </div>

                            <p className="text-2xl font-bold">

                                {
                                    stats.discussions
                                }

                            </p>

                            <p className="text-slate-400 text-sm mt-1">

                                Discussions

                            </p>

                        </div>


                        {/* COMMENTS */}

                        <div className="bg-slate-800 rounded-2xl p-5 text-center">

                            <div className="flex justify-center mb-2">

                                <MessageCircle
                                    size={22}
                                    className="text-orange-400"
                                />

                            </div>

                            <p className="text-2xl font-bold">

                                {
                                    stats.comments
                                }

                            </p>

                            <p className="text-slate-400 text-sm mt-1">

                                Comments

                            </p>

                        </div>


                        {/* LIKES */}

                        <div className="bg-slate-800 rounded-2xl p-5 text-center">

                            <div className="flex justify-center mb-2">

                                <Heart
                                    size={22}
                                    className="text-orange-400"
                                />

                            </div>

                            <p className="text-2xl font-bold">

                                {
                                    stats.likesReceived
                                }

                            </p>

                            <p className="text-slate-400 text-sm mt-1">

                                Likes Received

                            </p>

                        </div>


                    </div>


                </div>


                {/* =================================================
                    DISCUSSIONS SECTION
                ================================================= */}

                <div className="mt-8">


                    <div className="flex items-center justify-between mb-5">

                        <div>

                            <h2 className="text-2xl font-bold">

                                {orbitId
                                    ? `${user.name}'s Discussions`
                                    : "Your Discussions"}

                            </h2>


                            <p className="text-slate-500 text-sm mt-1">

                                Discussions started in Orbit

                            </p>

                        </div>


                        <span className="text-slate-500">

                            {discussions.length}

                        </span>

                    </div>


                    {/* =================================================
                        LOADING
                    ================================================= */}

                    {discussionsLoading && (

                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">

                            <p className="text-slate-400">

                                Loading discussions...

                            </p>

                        </div>

                    )}


                    {/* =================================================
                        EMPTY
                    ================================================= */}

                    {!discussionsLoading &&
                        discussions.length === 0 && (

                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">

                                <MessageCircle
                                    size={30}
                                    className="mx-auto text-slate-600 mb-3"
                                />

                                <p className="text-slate-400">

                                    {orbitId
                                        ? "This user hasn't started any discussions yet."
                                        : "You haven't started any discussions yet."}

                                </p>

                            </div>

                        )}


                    {/* =================================================
                        DISCUSSION LIST
                    ================================================= */}

                    {!discussionsLoading &&
                        discussions.length > 0 && (

                            <div className="space-y-4">

                                {discussions.map(
                                    (discussion) => (

                                        <div

                                            key={
                                                discussion.id
                                            }

                                            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition"

                                        >

                                            {/* =================================================
                                                TITLE
                                            ================================================= */}

                                            <h3 className="text-xl font-semibold text-white">

                                                {
                                                    discussion.title
                                                }

                                            </h3>


                                            {/* =================================================
                                                DESCRIPTION
                                            ================================================= */}

                                            <p className="text-slate-400 mt-2 leading-relaxed">

                                                {
                                                    discussion.description
                                                }

                                            </p>


                                            {/* =================================================
                                                FOOTER
                                            ================================================= */}

                                            <div className="flex items-center gap-5 mt-5 text-sm">


                                                {/* LIKES */}

                                                <div className="flex items-center gap-2 text-slate-400">

                                                    <Heart
                                                        size={17}
                                                        className="text-orange-400"
                                                    />

                                                    {
                                                        discussion.likes ||
                                                        0
                                                    }

                                                    Likes

                                                </div>


                                                {/* DATE */}

                                                <div className="text-slate-500">

                                                    {formatDate(
                                                        discussion.created_at
                                                    )}

                                                </div>


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