import { useEffect, useState } from "react";
import { Send, MessageCircle, User } from "lucide-react";
import { io } from "socket.io-client";

function Chat() {

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const API_BASE = "http://localhost:5000/api";

  // =====================================================
  // CURRENT USER
  // =====================================================

  const storedUser = localStorage.getItem("orbitUser");

  let currentUser = null;

  try {

    currentUser = storedUser
      ? JSON.parse(storedUser)
      : null;

  } catch {

    currentUser = null;

  }


  // =====================================================
  // LOAD MESSAGES + SOCKET
  // =====================================================

  useEffect(() => {

    // Load existing messages
    const loadMessages = async () => {

      try {

        const token =
          localStorage.getItem("orbitToken");

        const response = await fetch(
          `${API_BASE}/chat`,
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

      } catch (error) {

        console.error(
          "LOAD CHAT ERROR:",
          error
        );

        setError(
          error.message ||
          "Failed to load chat."
        );

      } finally {

        setLoading(false);

      }

    };


    // =================================================
    // SOCKET.IO CONNECTION
    // =================================================

    const socket =
      io("http://localhost:5000");


    socket.on("connect", () => {

      console.log(
        "Connected to Orbit Chat:",
        socket.id
      );

      socket.emit(
        "join-chat"
      );

    });


    socket.on(
      "new-message",
      (newMessage) => {

        setMessages(
          (current) => {

            // Prevent duplicate message
            if (
              current.some(
                (item) =>
                  item.id ===
                  newMessage.id
              )
            ) {

              return current;

            }

            return [
              ...current,
              newMessage
            ];

          }
        );

      }
    );


    socket.on(
      "disconnect",
      () => {

        console.log(
          "Disconnected from Orbit Chat"
        );

      }
    );


    loadMessages();


    // =================================================
    // CLEANUP
    // =================================================

    return () => {

      socket.disconnect();

    };

  }, []);


  // =====================================================
  // SEND MESSAGE
  // =====================================================

  const handleSend = async (e) => {

    e.preventDefault();

    if (!message.trim()) {
      return;
    }


    try {

      setSending(true);
      setError("");

      const token =
        localStorage.getItem(
          "orbitToken"
        );


      const response = await fetch(
        `${API_BASE}/chat`,
        {
          method: "POST",

          headers: {

            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,

          },

          body: JSON.stringify({

            message:
              message.trim(),

          }),

        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Failed to send message."
        );

      }


      /*
       * IMPORTANT:
       *
       * We DON'T manually add the message
       * here.
       *
       * The server broadcasts it through
       * Socket.IO and the socket listener
       * adds it to the chat.
       */


      setMessage("");


    } catch (error) {

      console.error(
        "SEND MESSAGE ERROR:",
        error
      );

      setError(
        error.message ||
        "Failed to send message."
      );

    } finally {

      setSending(false);

    }

  };


  // =====================================================
  // FORMAT TIME
  // =====================================================

  const formatTime = (date) => {

    if (!date) {
      return "";
    }

    return new Date(
      date
    ).toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );

  };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">

        <p className="text-slate-400">
          Loading Orbit Chat...
        </p>

      </div>

    );

  }


  // =====================================================
  // MAIN
  // =====================================================

  return (

    <div className="min-h-screen bg-slate-950 text-white">

      <div className="max-w-5xl mx-auto px-4 py-8">


        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6">

          <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center">

              <MessageCircle size={25} />

            </div>

            <div>

              <h1 className="text-3xl font-bold">
                Orbit Chat
              </h1>

              <p className="text-slate-400 text-sm">
                Talk about movies, shows and everything Orbit.
              </p>

            </div>

          </div>

        </div>


        {/* =================================================
            CHAT CONTAINER
        ================================================= */}

        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">


          {/* =================================================
              MESSAGES
          ================================================= */}

          <div className="h-[60vh] overflow-y-auto p-6 space-y-5">

            {messages.length === 0 ? (

              <div className="h-full flex items-center justify-center">

                <div className="text-center">

                  <MessageCircle
                    size={45}
                    className="mx-auto text-slate-700 mb-4"
                  />

                  <p className="text-slate-400">
                    No messages yet.
                  </p>

                  <p className="text-slate-600 text-sm mt-1">
                    Start the conversation 🚀
                  </p>

                </div>

              </div>

            ) : (

              messages.map((item) => {

                const isMine =
                  currentUser &&
                  item.user?.id ===
                    currentUser.id;


                return (

                  <div
                    key={item.id}
                    className={`flex gap-3 ${
                      isMine
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >


                    {/* OTHER USER AVATAR */}

                    {!isMine && (

                      <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center flex-shrink-0">

                        {item.user?.avatarUrl ? (

                          <img
                            src={
                              item.user.avatarUrl
                            }
                            alt={
                              item.user.name
                            }
                            className="w-full h-full object-cover"
                          />

                        ) : (

                          <User
                            size={18}
                            className="text-orange-500"
                          />

                        )}

                      </div>

                    )}


                    {/* MESSAGE */}

                    <div
                      className={`max-w-[75%] ${
                        isMine
                          ? "items-end"
                          : "items-start"
                      } flex flex-col`}
                    >

                      {!isMine && (

                        <span className="text-xs text-slate-500 mb-1 ml-1">

                          {item.user?.name}

                        </span>

                      )}


                      <div
                        className={`px-4 py-3 rounded-2xl ${
                          isMine
                            ? "bg-orange-500 text-white rounded-br-md"
                            : "bg-slate-800 text-slate-200 rounded-bl-md"
                        }`}
                      >

                        <p className="break-words">

                          {item.message}

                        </p>

                      </div>


                      <span className="text-[11px] text-slate-600 mt-1 px-1">

                        {formatTime(
                          item.createdAt
                        )}

                      </span>

                    </div>


                  </div>

                );

              })

            )}

          </div>


          {/* =================================================
              ERROR
          ================================================= */}

          {error && (

            <div className="px-6 pb-3">

              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">

                {error}

              </div>

            </div>

          )}


          {/* =================================================
              MESSAGE INPUT
          ================================================= */}

          <div className="border-t border-slate-800 p-4">

            <form
              onSubmit={handleSend}
              className="flex gap-3"
            >

              <input
                type="text"
                value={message}
                maxLength={500}
                onChange={(e) =>
                  setMessage(
                    e.target.value
                  )
                }
                placeholder="Write a message..."
                className="flex-1 px-5 py-4 rounded-2xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500 transition"
              />


              <button
                type="submit"
                disabled={
                  sending ||
                  !message.trim()
                }
                className="w-14 h-14 rounded-2xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition"
              >

                <Send size={20} />

              </button>

            </form>


            <div className="flex justify-between mt-2 px-1">

              <span className="text-xs text-slate-600">

                Logged in as{" "}

                {currentUser?.name ||
                  "User"}

              </span>


              <span className="text-xs text-slate-600">

                {message.length}/500

              </span>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}

export default Chat;