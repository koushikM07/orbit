import { useState, useEffect } from "react";

import {
    Pencil,
    Heart,
    Trash2,
    MessageCircle,
    Send,
} from "lucide-react";


function Movies() {

    const [showForm, setShowForm] =
        useState(false);

    const [title, setTitle] =
        useState("");

    const [description, setDescription] =
        useState("");

    const [editingId, setEditingId] =
        useState(null);

    const [openComments, setOpenComments] =
        useState(null);

    const [commentText, setCommentText] =
        useState("");

    const [discussions, setDiscussions] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [message, setMessage] =
        useState("");


    // =====================================================
    // API
    // =====================================================

    const API_URL =
        "http://localhost:5000/api/discussions";


    // =====================================================
    // GET TOKEN
    // =====================================================

    const getToken = () => {

        return localStorage.getItem(
            "orbitToken"
        );

    };


    // =====================================================
    // AUTH HEADERS
    // =====================================================

    const getAuthHeaders = () => {

        const token =
            getToken();


        if (!token) {

            return {
                "Content-Type":
                    "application/json"
            };

        }


        return {

            "Content-Type":
                "application/json",

            "Authorization":
                `Bearer ${token}`

        };

    };


    // =====================================================
    // LOAD DISCUSSIONS
    // =====================================================

    const fetchDiscussions =
        async () => {

            try {

                setLoading(true);

                setMessage("");


                const token =
                    getToken();


                console.log(
                    "Orbit token:",
                    token
                );


                // =========================================
                // TOKEN CHECK
                // =========================================

                if (!token) {

                    setMessage(
                        "Please login again."
                    );

                    return;

                }


                // =========================================
                // REQUEST
                // =========================================

                const response =
                    await fetch(
                        API_URL,
                        {
                            method: "GET",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${token}`
                            }
                        }
                    );


                const data =
                    await response.json();


                console.log(
                    "Discussion API response:",
                    data
                );


                // =========================================
                // ERROR
                // =========================================

                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Failed to load discussions."
                    );

                }


                // =========================================
                // SUCCESS
                // =========================================

                if (data.success) {

                    const formattedDiscussions =
                        (data.discussions || []).map(
                            (discussion) => ({

                                ...discussion,

                                liked:
                                    discussion.liked ||
                                    false,

                                comments:
                                    discussion.comments ||
                                    []

                            })
                        );


                    setDiscussions(
                        formattedDiscussions
                    );

                } else {

                    setDiscussions([]);

                }


            } catch (error) {

                console.error(
                    "Failed to load discussions:",
                    error
                );


                setDiscussions([]);


                setMessage(
                    error.message ||
                    "Failed to load discussions."
                );


            } finally {

                setLoading(false);

            }

        };


    // =====================================================
    // LOAD WHEN PAGE OPENS
    // =====================================================

    useEffect(() => {

        fetchDiscussions();

    }, []);


    // =====================================================
    // CREATE / UPDATE
    // =====================================================

    const handleSubmit =
        async (e) => {

            e.preventDefault();


            if (
                !title.trim() ||
                !description.trim()
            ) {

                setMessage(
                    "Please fill in both fields."
                );

                return;

            }


            const token =
                getToken();


            if (!token) {

                setMessage(
                    "Please login first."
                );

                return;

            }


            // =========================================
            // UPDATE
            // =========================================

            if (editingId !== null) {

                try {

                    const response =
                        await fetch(
                            `${API_URL}/${editingId}`,
                            {
                                method: "PUT",

                                headers:
                                    getAuthHeaders(),

                                body:
                                    JSON.stringify({

                                        title:
                                            title.trim(),

                                        description:
                                            description.trim()

                                    })

                            }
                        );


                    const data =
                        await response.json();


                    if (!response.ok) {

                        setMessage(
                            data.message ||
                            "Failed to update discussion."
                        );

                        return;

                    }


                    setMessage(
                        "Discussion updated successfully!"
                    );


                    setTitle("");

                    setDescription("");

                    setEditingId(null);

                    setShowForm(false);


                    await fetchDiscussions();


                } catch (error) {

                    console.error(error);

                    setMessage(
                        "Server is not responding."
                    );

                }


                return;

            }


            // =========================================
            // CREATE
            // =========================================

            try {

                const response =
                    await fetch(
                        API_URL,
                        {
                            method: "POST",

                            headers:
                                getAuthHeaders(),

                            body:
                                JSON.stringify({

                                    type:
                                        "DISCUSSION",

                                    title:
                                        title.trim(),

                                    description:
                                        description.trim()

                                })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    setMessage(
                        data.message ||
                        "Failed to create discussion."
                    );

                    return;

                }


                setMessage(
                    "Discussion created successfully!"
                );


                setTitle("");

                setDescription("");

                setShowForm(false);


                await fetchDiscussions();


            } catch (error) {

                console.error(error);

                setMessage(
                    "Server is not responding."
                );

            }

        };


    // =====================================================
    // EDIT
    // =====================================================

    const handleEdit =
        (discussion) => {

            setTitle(
                discussion.title
            );

            setDescription(
                discussion.description
            );

            setEditingId(
                discussion.id
            );

            setShowForm(true);

            setMessage("");


            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        };


    // =====================================================
    // DELETE
    // =====================================================

    const handleDelete =
        async (id) => {

            const confirmed =
                window.confirm(
                    "Are you sure you want to delete this discussion?"
                );


            if (!confirmed) {

                return;

            }


            try {

                const response =
                    await fetch(
                        `${API_URL}/${id}`,
                        {
                            method: "DELETE",

                            headers:
                                getAuthHeaders()
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    setMessage(
                        data.message ||
                        "Failed to delete discussion."
                    );

                    return;

                }


                setMessage(
                    "Discussion deleted successfully!"
                );


                if (
                    openComments === id
                ) {

                    setOpenComments(null);

                    setCommentText("");

                }


                await fetchDiscussions();


            } catch (error) {

                console.error(error);

                setMessage(
                    "Server is not responding."
                );

            }

        };


    // =====================================================
    // LIKE / UNLIKE
    // =====================================================

    const handleLike =
        async (discussion) => {

            try {

                const response =
                    await fetch(
                        `${API_URL}/${discussion.id}/like`,
                        {
                            method: "POST",

                            headers:
                                getAuthHeaders()
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Like request failed."
                    );

                }


                setDiscussions(
                    (currentDiscussions) =>

                        currentDiscussions.map(
                            (item) =>

                                item.id ===
                                discussion.id

                                    ? {

                                        ...item,

                                        liked:
                                            data.liked,

                                        likes:
                                            data.likes

                                    }

                                    : item
                        )

                );


            } catch (error) {

                console.error(
                    "Like request failed:",
                    error
                );


                setMessage(
                    error.message ||
                    "Unable to update like."
                );

            }

        };


    // =====================================================
    // COMMENTS OPEN / CLOSE
    // =====================================================

    const toggleComments =
        (id) => {

            if (
                openComments === id
            ) {

                setOpenComments(null);

                setCommentText("");

            } else {

                setOpenComments(id);

                setCommentText("");

            }

        };


    // =====================================================
    // ADD COMMENT
    // =====================================================

    const handleAddComment =
        async (discussionId) => {

            const trimmedComment =
                commentText.trim();


            if (!trimmedComment) {

                return;

            }


            try {

                const response =
                    await fetch(
                        `${API_URL}/${discussionId}/comments`,
                        {
                            method: "POST",

                            headers:
                                getAuthHeaders(),

                            body:
                                JSON.stringify({

                                    comment:
                                        trimmedComment

                                })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    setMessage(
                        data.message ||
                        "Failed to add comment."
                    );

                    return;

                }


                setCommentText("");


                if (data.comment) {

                    setDiscussions(
                        (currentDiscussions) =>

                            currentDiscussions.map(
                                (discussion) =>

                                    discussion.id ===
                                    discussionId

                                        ? {

                                            ...discussion,

                                            comments: [

                                                ...(discussion.comments ||
                                                    []),

                                                data.comment

                                            ]

                                        }

                                        : discussion
                            )

                    );

                } else {

                    await fetchDiscussions();

                }


            } catch (error) {

                console.error(error);

                setMessage(
                    "Server is not responding."
                );

            }

        };


    // =====================================================
    // CANCEL
    // =====================================================

    const handleCancel =
        () => {

            setTitle("");

            setDescription("");

            setEditingId(null);

            setShowForm(false);

            setMessage("");

        };


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="min-h-screen bg-slate-950 text-white">

            <div className="max-w-6xl mx-auto px-6 py-16">


                {/* ==========================================
                    HEADER
                ========================================== */}

                <div className="text-center">

                    <h1 className="text-5xl font-bold">
                        🎬 Movies
                    </h1>


                    <p className="text-slate-400 mt-4 text-lg">

                        Discuss movies, share reviews and
                        discover something new.

                    </p>


                    <button
                        onClick={() => {

                            if (showForm) {

                                handleCancel();

                            } else {

                                setShowForm(true);

                                setMessage("");

                            }

                        }}
                        className="mt-6 bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-xl font-semibold transition"
                    >

                        {showForm
                            ? "Cancel"
                            : "+ Create Discussion"}

                    </button>

                </div>


                {/* ==========================================
                    MESSAGE
                ========================================== */}

                {message && (

                    <div className="max-w-2xl mx-auto mt-6">

                        <div className="bg-slate-900 border border-slate-800 rounded-xl px-5 py-3 text-center text-slate-300">

                            {message}

                        </div>

                    </div>

                )}


                {/* ==========================================
                    CREATE / EDIT FORM
                ========================================== */}

                {showForm && (

                    <div className="mt-8 bg-slate-900 border border-slate-800 rounded-2xl p-6">

                        <h2 className="text-2xl font-semibold mb-6">

                            {editingId !== null
                                ? "Edit Discussion"
                                : "Create Discussion"}

                        </h2>


                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >

                            <input
                                type="text"
                                placeholder="Discussion title"
                                value={title}
                                onChange={(e) =>
                                    setTitle(
                                        e.target.value
                                    )
                                }
                                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-orange-500"
                            />


                            <textarea
                                placeholder="What's on your mind?"
                                value={description}
                                onChange={(e) =>
                                    setDescription(
                                        e.target.value
                                    )
                                }
                                rows="4"
                                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-orange-500 resize-none"
                            />


                            <div className="flex justify-end gap-3">

                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition"
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 font-semibold transition"
                                >

                                    {editingId !== null
                                        ? "Save Changes"
                                        : "Post Discussion"}

                                </button>

                            </div>

                        </form>

                    </div>

                )}


                {/* ==========================================
                    DISCUSSIONS
                ========================================== */}

                <div className="mt-16">

                    <h2 className="text-2xl font-bold mb-6">
                        🔥 Popular Discussions
                    </h2>


                    <div className="space-y-6">


                        {/* LOADING */}

                        {loading && (

                            <p className="text-slate-400">
                                Loading discussions...
                            </p>

                        )}


                        {/* EMPTY */}

                        {!loading &&
                            discussions.length === 0 && (

                                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">

                                    <p className="text-slate-400">
                                        No discussions yet.
                                    </p>

                                    <p className="text-slate-500 text-sm mt-2">
                                        Be the first person to start one!
                                    </p>

                                </div>

                            )}


                        {/* DISCUSSIONS */}

                        {!loading &&
                            discussions.map(
                                (discussion) => (

                                    <div
                                        key={
                                            discussion.id
                                        }
                                        className="relative bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-orange-500 transition"
                                    >


                                        {/* ACTION BUTTONS */}

                                        <div className="absolute top-5 right-5 flex items-center gap-2">


                                            {/* LIKE */}

                                            <button
                                                onClick={() =>
                                                    handleLike(
                                                        discussion
                                                    )
                                                }
                                                className={`p-2 rounded-lg transition ${
                                                    discussion.liked
                                                        ? "text-red-500 bg-slate-800"
                                                        : "text-slate-400 hover:text-red-500 hover:bg-slate-800"
                                                }`}
                                                title={
                                                    discussion.liked
                                                        ? "Unlike"
                                                        : "Like"
                                                }
                                            >

                                                <Heart
                                                    size={18}
                                                    fill={
                                                        discussion.liked
                                                            ? "currentColor"
                                                            : "none"
                                                    }
                                                />

                                            </button>


                                            {/* EDIT */}

                                            <button
                                                onClick={() =>
                                                    handleEdit(
                                                        discussion
                                                    )
                                                }
                                                className="p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition"
                                                title="Edit"
                                            >

                                                <Pencil
                                                    size={18}
                                                />

                                            </button>


                                            {/* DELETE */}

                                            <button
                                                onClick={() =>
                                                    handleDelete(
                                                        discussion.id
                                                    )
                                                }
                                                className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-800 transition"
                                                title="Delete"
                                            >

                                                <Trash2
                                                    size={18}
                                                />

                                            </button>

                                        </div>


                                        {/* TYPE */}

                                        <span className="text-orange-500 text-sm font-semibold">

                                            {discussion.type}

                                        </span>


                                        {/* TITLE */}

                                        <h2 className="text-xl font-semibold mt-3 pr-32">

                                            {discussion.title}

                                        </h2>


                                        {/* DESCRIPTION */}

                                        <p className="text-slate-400 mt-2">

                                            {discussion.description}

                                        </p>


                                        {/* USER / LIKES / COMMENTS */}

                                        <div className="flex items-center gap-6 mt-5 text-slate-400 text-sm">


                                            <span>
                                                👤{" "}
                                                {typeof discussion.user ===
                                                "object"
                                                    ? discussion.user.name
                                                    : discussion.user ||
                                                      "User"}
                                            </span>


                                            {/* LIKES */}

                                            <span
                                                className={`flex items-center gap-1 ${
                                                    discussion.liked
                                                        ? "text-red-500"
                                                        : ""
                                                }`}
                                            >

                                                <Heart
                                                    size={15}
                                                    fill={
                                                        discussion.liked
                                                            ? "currentColor"
                                                            : "none"
                                                    }
                                                />

                                                {discussion.likes ||
                                                    0}

                                            </span>


                                            {/* COMMENTS */}

                                            <button
                                                onClick={() =>
                                                    toggleComments(
                                                        discussion.id
                                                    )
                                                }
                                                className={`flex items-center gap-1 transition ${
                                                    openComments ===
                                                    discussion.id
                                                        ? "text-orange-500"
                                                        : "hover:text-orange-500"
                                                }`}
                                            >

                                                <MessageCircle
                                                    size={15}
                                                />

                                                {discussion.comments
                                                    ?.length || 0}

                                            </button>

                                        </div>


                                        {/* COMMENTS */}

                                        {openComments ===
                                            discussion.id && (

                                            <div className="mt-6 pt-6 border-t border-slate-800">

                                                <h3 className="text-lg font-semibold mb-4">
                                                    💬 Comments
                                                </h3>


                                                <div className="space-y-3">

                                                    {!discussion.comments ||
                                                    discussion.comments.length ===
                                                        0 ? (

                                                        <p className="text-slate-500 text-sm">
                                                            No comments yet. Be the first to comment!
                                                        </p>

                                                    ) : (

                                                        discussion.comments.map(
                                                            (comment) => (

                                                                <div
                                                                    key={
                                                                        comment.id
                                                                    }
                                                                    className="bg-slate-800 rounded-xl p-4"
                                                                >

                                                                    <span className="text-sm font-semibold text-orange-400">

                                                                        👤{" "}

                                                                        {typeof comment.user ===
                                                                        "object"
                                                                            ? comment.user.name
                                                                            : comment.user ||
                                                                              "User"}

                                                                    </span>


                                                                    <p className="text-slate-300 mt-2">

                                                                        {comment.text ||
                                                                            comment.comment}

                                                                    </p>

                                                                </div>

                                                            )
                                                        )

                                                    )}

                                                </div>


                                                {/* ADD COMMENT */}

                                                <div className="flex gap-3 mt-5">

                                                    <input
                                                        type="text"
                                                        placeholder="Write a comment..."
                                                        value={
                                                            openComments ===
                                                            discussion.id
                                                                ? commentText
                                                                : ""
                                                        }
                                                        onChange={(e) =>
                                                            setCommentText(
                                                                e.target.value
                                                            )
                                                        }
                                                        onKeyDown={(e) => {

                                                            if (
                                                                e.key ===
                                                                "Enter"
                                                            ) {

                                                                handleAddComment(
                                                                    discussion.id
                                                                );

                                                            }

                                                        }}
                                                        className="flex-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-orange-500"
                                                    />


                                                    <button
                                                        onClick={() =>
                                                            handleAddComment(
                                                                discussion.id
                                                            )
                                                        }
                                                        className="px-4 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 transition"
                                                        title="Add Comment"
                                                    >

                                                        <Send
                                                            size={18}
                                                        />

                                                    </button>

                                                </div>

                                            </div>

                                        )}

                                    </div>

                                )
                            )}

                    </div>

                </div>

            </div>

        </div>

    );

}


export default Movies;