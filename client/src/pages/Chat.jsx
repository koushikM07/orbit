import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  MessageCircle,
  Send,
  Reply,
  Pencil,
  Trash2,
  X,
  Check,
} from "lucide-react";

import { io } from "socket.io-client";


// =====================================================
// SOCKET.IO
// =====================================================

const socket = io("http://localhost:5000");


// =====================================================
// CHAT
// =====================================================

function Chat() {

  const navigate = useNavigate();

  // ===================================================
  // STATE
  // ===================================================

  const [messages, setMessages] = useState([]);

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // IMPORTANT:
  // Track MESSAGE ID, not USER ID.
  //
  // Otherwise if the same user has 10 messages,
  // all 10 profile cards would open.

  const [hoveredMessageId, setHoveredMessageId] =
    useState(null);


  // Editing

  const [editingId, setEditingId] =
    useState(null);

  const [editingText, setEditingText] =
    useState("");


  // Reply

  const [replyingTo, setReplyingTo] =
    useState(null);


  const messagesEndRef =
    useRef(null);

  const inputRef =
    useRef(null);


  // ===================================================
  // CURRENT USER
  // ===================================================

  const storedUser =
    localStorage.getItem("orbitUser");

  let currentUser = null;

  try {

    currentUser =
      storedUser
        ? JSON.parse(storedUser)
        : null;

  } catch {

    currentUser = null;

  }


  const token =
    localStorage.getItem("orbitToken");


  // ===================================================
  // SCROLL TO BOTTOM
  // ===================================================

  const scrollToBottom = () => {

    setTimeout(() => {

      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });

    }, 100);

  };


  // ===================================================
  // LOAD MESSAGES
  // ===================================================

  const loadMessages = async () => {

    try {

      setLoading(true);

      const response =
        await fetch(
          "http://localhost:5000/api/chat",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Failed to load messages."
        );

      }


      setMessages(
        data.messages || []
      );

      scrollToBottom();

    } catch (err) {

      console.error(
        "LOAD CHAT ERROR:",
        err
      );

      setError(
        err.message ||
        "Failed to load chat."
      );

    } finally {

      setLoading(false);

    }

  };


  // ===================================================
  // INITIAL LOAD + SOCKET
  // ===================================================

  useEffect(() => {

    if (!token) {

      navigate("/login");

      return;

    }


    loadMessages();


    // Join chat room

    socket.emit(
      "join-chat"
    );


    // =================================================
    // NEW MESSAGE
    // =================================================

    const handleNewMessage =
      (newMessage) => {

        setMessages((previous) => {

          const exists =
            previous.some(
              (item) =>
                item.id ===
                newMessage.id
            );


          if (exists) {

            return previous;

          }


          return [
            ...previous,
            newMessage,
          ];

        });


        scrollToBottom();

      };


    // =================================================
    // UPDATED MESSAGE
    // =================================================

    const handleMessageUpdated =
      (updatedMessage) => {

        setMessages((previous) =>

          previous.map(
            (item) =>

              item.id ===
              updatedMessage.id

                ? updatedMessage

                : item

          )

        );

      };


    // =================================================
    // DELETED MESSAGE
    // =================================================

    const handleMessageDeleted =
      (deletedId) => {

        setMessages((previous) =>

          previous.filter(
            (item) =>
              item.id !== deletedId
          )

        );

      };


    socket.on(
      "message-created",
      handleNewMessage
    );

    socket.on(
      "new-message",
      handleNewMessage
    );

    socket.on(
      "message-updated",
      handleMessageUpdated
    );

    socket.on(
      "message-deleted",
      handleMessageDeleted
    );


    // =================================================
    // CLEANUP
    // =================================================

    return () => {

      socket.off(
        "message-created",
        handleNewMessage
      );

      socket.off(
        "new-message",
        handleNewMessage
      );

      socket.off(
        "message-updated",
        handleMessageUpdated
      );

      socket.off(
        "message-deleted",
        handleMessageDeleted
      );

    };

  }, [token, navigate]);


  // ===================================================
  // SEND MESSAGE
  // ===================================================

  const handleSend = async (event) => {

    event.preventDefault();


    const text =
      message.trim();


    if (!text) {

      return;

    }


    try {

      const response =
        await fetch(
          "http://localhost:5000/api/chat",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              message: text,
            }),

          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        alert(
          data.message ||
          "Failed to send message."
        );

        return;

      }


      // Add immediately

      if (data.message) {

        setMessages((previous) => {

          const exists =
            previous.some(
              (item) =>
                item.id ===
                data.message.id
            );


          if (exists) {

            return previous;

          }


          return [
            ...previous,
            data.message,
          ];

        });

      }


      setMessage("");

      setReplyingTo(null);

      scrollToBottom();


      setTimeout(() => {

        inputRef.current?.focus();

      }, 100);


    } catch (err) {

      console.error(
        "SEND MESSAGE ERROR:",
        err
      );

      alert(
        "Server is not responding."
      );

    }

  };


  // ===================================================
  // START EDIT
  // ===================================================

  const startEdit = (item) => {

    setEditingId(item.id);

    setEditingText(
      item.message
    );

  };


  // ===================================================
  // CANCEL EDIT
  // ===================================================

  const cancelEdit = () => {

    setEditingId(null);

    setEditingText("");

  };


  // ===================================================
  // SAVE EDIT
  // ===================================================

  const saveEdit = async (id) => {

    const text =
      editingText.trim();


    if (!text) {

      return;

    }


    try {

      const response =
        await fetch(
          `http://localhost:5000/api/chat/${id}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              message: text,
            }),

          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        alert(
          data.message ||
          "Failed to edit message."
        );

        return;

      }


      if (data.message) {

        setMessages((previous) =>

          previous.map(
            (item) =>

              item.id === id
                ? data.message
                : item

          )

        );

      }


      setEditingId(null);

      setEditingText("");

    } catch (err) {

      console.error(
        "EDIT MESSAGE ERROR:",
        err
      );

      alert(
        "Failed to edit message."
      );

    }

  };


  // ===================================================
  // DELETE MESSAGE
  // ===================================================

  const handleDelete = async (id) => {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this message?"
      );


    if (!confirmed) {

      return;

    }


    try {

      const response =
        await fetch(
          `http://localhost:5000/api/chat/${id}`,
          {
            method: "DELETE",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        alert(
          data.message ||
          "Failed to delete message."
        );

        return;

      }


      setMessages((previous) =>

        previous.filter(
          (item) =>
            item.id !== id
        )

      );

    } catch (err) {

      console.error(
        "DELETE MESSAGE ERROR:",
        err
      );

      alert(
        "Failed to delete message."
      );

    }

  };


  // ===================================================
  // REPLY
  // ===================================================

  const handleReply = (item) => {

    setReplyingTo(item);

    setMessage(
      `@${item.user?.name || "user"} `
    );


    setTimeout(() => {

      inputRef.current?.focus();

    }, 100);

  };


  // ===================================================
  // VIEW PROFILE
  // ===================================================

  const handleViewProfile = (userId) => {

    setHoveredMessageId(null);

    navigate(
      `/profile/${userId}`
    );

  };


  // ===================================================
  // FORMAT TIME
  // ===================================================

  const formatTime = (date) => {

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


    return value.toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );

  };


  // ===================================================
  // AVATAR
  // ===================================================

  const getAvatar = (user) => {

    if (
      user?.avatarUrl &&
      user.avatarUrl.trim()
    ) {

      return user.avatarUrl;

    }

    return null;

  };


  // ===================================================
  // INITIAL
  // ===================================================

  const getInitial = (name) => {

    if (!name) {

      return "?";

    }


    return name
      .charAt(0)
      .toUpperCase();

  };


  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {

    return (

      <div className="min-h-screen bg-slate-950 flex items-center justify-center">

        <div className="text-slate-400">

          Loading Orbit Chat...

        </div>

      </div>

    );

  }


  // ===================================================
  // PAGE
  // ===================================================

  return (

    <div className="min-h-screen bg-slate-950 text-white">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="max-w-7xl mx-auto px-6 pt-8">

        <div className="flex items-center gap-4">

          <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center">

            <MessageCircle
              size={30}
            />

          </div>


          <div>

            <h1 className="text-4xl font-bold">

              Orbit Chat

            </h1>


            <p className="text-slate-400 text-lg">

              Talk about movies, shows and everything Orbit.

            </p>

          </div>

        </div>

      </div>


      {/* =================================================
          CHAT
      ================================================= */}

      <div className="max-w-7xl mx-auto px-6 mt-8">

        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">


          {/* =================================================
              MESSAGES
          ================================================= */}

          <div className="h-[600px] overflow-y-auto p-6 space-y-6">


            {/* ERROR */}

            {error && (

              <div className="bg-red-600/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl">

                {error}

              </div>

            )}


            {/* EMPTY */}

            {messages.length === 0 && !error && (

              <div className="h-full flex items-center justify-center text-slate-500">

                No messages yet. Start the conversation! 🚀

              </div>

            )}


            {/* =================================================
                MESSAGE LOOP
            ================================================= */}

            {messages.map((item) => {

              const isOwnMessage =
                currentUser &&
                Number(item.user?.id) ===
                Number(currentUser.id);


              const isEditing =
                editingId === item.id;


              const avatar =
                getAvatar(
                  item.user
                );


              const profileOpen =
                hoveredMessageId ===
                item.id;


              return (

                <div
                  key={item.id}
                  className={`flex gap-4 ${
                    isOwnMessage
                      ? "flex-row-reverse"
                      : ""
                  }`}
                >


                  {/* =================================================
                      AVATAR + PROFILE CARD
                  ================================================= */}

                  <div
                    className="relative flex-shrink-0"
                    onMouseEnter={() =>
                      setHoveredMessageId(
                        item.id
                      )
                    }
                  >

                    {/* AVATAR */}

                    {avatar ? (

                      <img
                        src={avatar}
                        alt={
                          item.user?.name
                        }
                        className="w-12 h-12 rounded-full object-cover border-2 border-slate-700 cursor-pointer hover:border-orange-500 transition"
                      />

                    ) : (

                      <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-lg cursor-pointer">

                        {getInitial(
                          item.user?.name
                        )}

                      </div>

                    )}


                    {/* =================================================
                        PROFILE POPUP
                    ================================================= */}

                    {profileOpen && (

                      <div
                        className={`absolute top-0 z-[100] ${
                          isOwnMessage
                            ? "right-14"
                            : "left-14"
                        }`}
                        onMouseEnter={() =>
                          setHoveredMessageId(
                            item.id
                          )
                        }
                        onMouseLeave={() =>
                          setHoveredMessageId(
                            null
                          )
                        }
                      >

                        {/* =============================================
                            INVISIBLE HOVER BRIDGE

                            Prevents the popup from disappearing while
                            moving the mouse from avatar to card.
                        ============================================= */}

                        <div
                          className={`absolute top-0 h-full w-6 ${
                            isOwnMessage
                              ? "right-full"
                              : "left-full"
                          }`}
                        />


                        {/* PROFILE CARD */}

                        <div className="w-72 bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl">

                          {/* USER */}

                          <div className="flex items-center gap-4">

                            {avatar ? (

                              <img
                                src={avatar}
                                alt={
                                  item.user?.name
                                }
                                className="w-16 h-16 rounded-full object-cover border-2 border-slate-700"
                              />

                            ) : (

                              <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-2xl">

                                {getInitial(
                                  item.user?.name
                                )}

                              </div>

                            )}


                            <div>

                              <h3 className="text-lg font-semibold text-white">

                                {
                                  item.user?.name
                                }

                              </h3>


                              <p className="text-slate-400 text-sm">

                                Orbit Member

                              </p>

                            </div>

                          </div>


                          {/* VIEW PROFILE */}

                          <button
                            type="button"
                            onClick={() =>
                              handleViewProfile(
                                item.user.id
                              )
                            }
                            className="w-full mt-5 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold transition"
                          >

                            View Profile

                          </button>

                        </div>

                      </div>

                    )}

                  </div>


                  {/* =================================================
                      MESSAGE CONTENT
                  ================================================= */}

                  <div
                    className={`max-w-[70%] flex flex-col ${
                      isOwnMessage
                        ? "items-end"
                        : "items-start"
                    }`}
                  >


                    {/* USER NAME */}

                    <div
                      className={`text-sm text-slate-400 mb-1 ${
                        isOwnMessage
                          ? "text-right"
                          : ""
                      }`}
                    >

                      {item.user?.name}

                    </div>


                    {/* =================================================
                        EDIT MODE
                    ================================================= */}

                    {isEditing ? (

                      <div className="w-full min-w-[300px]">

                        <textarea
                          value={
                            editingText
                          }
                          onChange={(e) =>
                            setEditingText(
                              e.target.value
                            )
                          }
                          maxLength={500}
                          rows={3}
                          autoFocus
                          className="w-full bg-slate-800 border border-orange-500 rounded-2xl px-4 py-3 text-white outline-none resize-none"
                        />


                        <div className="flex justify-end gap-2 mt-2">

                          <button
                            type="button"
                            onClick={
                              cancelEdit
                            }
                            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm"
                          >

                            <X
                              size={16}
                            />

                          </button>


                          <button
                            type="button"
                            onClick={() =>
                              saveEdit(
                                item.id
                              )
                            }
                            className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm"
                          >

                            <Check
                              size={16}
                            />

                          </button>

                        </div>

                      </div>

                    ) : (

                      /* =================================================
                         NORMAL MESSAGE
                      ================================================= */

                      <div
                        className={`px-5 py-3 rounded-2xl ${
                          isOwnMessage
                            ? "bg-orange-500 text-white rounded-tr-sm"
                            : "bg-slate-800 text-slate-200 rounded-tl-sm"
                        }`}
                      >

                        {/* REPLY PREVIEW */}

                        {item.replyTo && (

                          <div className="mb-2 px-3 py-2 rounded-lg bg-black/20 border-l-2 border-orange-300 text-sm">

                            <div className="font-semibold">

                              {
                                item
                                  .replyTo
                                  .userName
                              }

                            </div>


                            <div className="opacity-70 truncate">

                              {
                                item
                                  .replyTo
                                  .message
                              }

                            </div>

                          </div>

                        )}


                        {/* MESSAGE */}

                        <div className="whitespace-pre-wrap break-words">

                          {item.message}

                        </div>

                      </div>

                    )}


                    {/* =================================================
                        ACTIONS
                    ================================================= */}

                    {!isEditing && (

                      <div
                        className={`flex items-center gap-3 mt-2 text-xs text-slate-500 ${
                          isOwnMessage
                            ? "flex-row-reverse"
                            : ""
                        }`}
                      >

                        {/* TIME */}

                        <span>

                          {
                            formatTime(
                              item.createdAt
                            )
                          }

                        </span>


                        {/* REPLY */}

                        <button
                          type="button"
                          onClick={() =>
                            handleReply(
                              item
                            )
                          }
                          className="flex items-center gap-1 hover:text-orange-400 transition"
                        >

                          <Reply
                            size={14}
                          />

                          Reply

                        </button>


                        {/* EDIT */}

                        {isOwnMessage && (

                          <button
                            type="button"
                            onClick={() =>
                              startEdit(
                                item
                              )
                            }
                            className="flex items-center gap-1 hover:text-orange-400 transition"
                          >

                            <Pencil
                              size={14}
                            />

                            Edit

                          </button>

                        )}


                        {/* DELETE */}

                        {isOwnMessage && (

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                item.id
                              )
                            }
                            className="flex items-center gap-1 hover:text-red-400 transition"
                          >

                            <Trash2
                              size={14}
                            />

                            Delete

                          </button>

                        )}

                      </div>

                    )}

                  </div>

                </div>

              );

            })}


            {/* SCROLL TARGET */}

            <div
              ref={messagesEndRef}
            />

          </div>


          {/* =================================================
              REPLY BAR
          ================================================= */}

          {replyingTo && (

            <div className="border-t border-slate-800 px-6 py-3 bg-slate-950/50 flex items-center justify-between">

              <div>

                <p className="text-xs text-orange-400">

                  Replying to{" "}

                  {
                    replyingTo
                      .user
                      ?.name
                  }

                </p>


                <p className="text-sm text-slate-400 truncate max-w-xl">

                  {
                    replyingTo.message
                  }

                </p>

              </div>


              <button
                type="button"
                onClick={() =>
                  setReplyingTo(
                    null
                  )
                }
                className="text-slate-400 hover:text-white"
              >

                <X size={20} />

              </button>

            </div>

          )}


          {/* =================================================
              INPUT
          ================================================= */}

          <div className="border-t border-slate-800 p-5">

            <form
              onSubmit={
                handleSend
              }
              className="flex gap-3"
            >

              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) =>
                  setMessage(
                    e.target.value
                  )
                }
                placeholder="Write a message..."
                maxLength={500}
                className="flex-1 bg-slate-800 border border-slate-700 focus:border-orange-500 rounded-2xl px-5 py-4 text-white outline-none transition"
              />


              <button
                type="submit"
                disabled={
                  !message.trim()
                }
                className="px-6 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-700 disabled:text-slate-500 rounded-2xl text-white font-semibold transition flex items-center gap-2"
              >

                <Send
                  size={18}
                />

                Send

              </button>

            </form>


            {/* CHARACTER COUNT */}

            <div className="text-right text-xs text-slate-600 mt-2">

              {message.length}/500

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}


export default Chat;