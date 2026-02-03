import React, {
  useState,
  useEffect,
  useRef,
  createContext,
  useContext,
} from "react";
import io from "socket.io-client";
import {
  Mic,
  Monitor,
  Smartphone,
  Power,
  MessageSquare,
  Send,
  Hand,
  ArrowLeft,
  LogIn,
  LogOut,
  BarChart3,
  Users,
  Copy,
  Check,
  X,
  Volume2,
  VolumeX,
  Play,
  Square,
  TrendingUp,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════
// CONFIG - Auto-detect backend URL
// ═══════════════════════════════════════════════════════════════

const BACKEND = import.meta.env.VITE_BACKEND_URL;

// const socketRef = useRef(null);

const socketRef = { current: null };

const RTC_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:global.stun.twilio.com:3478" },
  ],
};

// ═══════════════════════════════════════════════════════════════
// AUTH CONTEXT
// ═══════════════════════════════════════════════════════════════

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetch(`${BACKEND}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((d) => setUser(d.user))
        .catch(() => {
          localStorage.removeItem("token");
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    const res = await fetch(`${BACKEND}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (name, email, password) => {
    const res = await fetch(`${BACKEND}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

const useAuth = () => useContext(AuthContext);

// ═══════════════════════════════════════════════════════════════
// UI COMPONENTS
// ═══════════════════════════════════════════════════════════════

const Logo = ({ sm }) => (
  <div
    className={`flex items-center gap-2 font-black ${sm ? "text-xl" : "text-2xl"}`}
  >
    <div className="bg-cyan-500 text-black px-2 py-1 rounded-lg">S</div>
    <span>
      Speak<span className="text-cyan-500">App</span>
    </span>
  </div>
);

const Card = ({ children, className = "" }) => (
  <div
    className={`bg-slate-900/80 backdrop-blur border border-white/10 rounded-2xl p-6 ${className}`}
  >
    {children}
  </div>
);

const Button = ({
  children,
  variant = "primary",
  size = "md",
  disabled,
  onClick,
  className = "",
  type = "button",
}) => {
  const base =
    "font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50";
  const v = {
    primary: "bg-cyan-500 hover:bg-cyan-400 text-black",
    secondary: "bg-slate-800 hover:bg-slate-700 text-white",
    danger:
      "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50",
    ghost: "hover:bg-white/10 text-slate-400 hover:text-white",
  };
  const s = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3",
    lg: "px-6 py-4 text-lg",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${v[variant]} ${s[size]} ${className}`}
    >
      {children}
    </button>
  );
};

const Input = ({ label, ...props }) => (
  <div>
    {label && (
      <label className="block text-sm text-slate-400 mb-1">{label}</label>
    )}
    <input
      className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-white outline-none focus:border-cyan-500"
      {...props}
    />
  </div>
);

const QR = ({ value, size = 200 }) => (
  <img
    src={`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
      value,
    )}`}
    alt="QR"
    className="rounded-lg"
    style={{ width: size, height: size }}
  />
);

const Status = ({ connected }) => (
  <div
    className={`fixed top-4 right-4 z-50 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 ${
      connected
        ? "bg-green-500/20 text-green-400"
        : "bg-red-500/20 text-red-400"
    }`}
  >
    <div
      className={`w-2 h-2 rounded-full ${connected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
    />
    {connected ? "ONLINE" : "OFFLINE"}
  </div>
);

const CopyBtn = ({ text }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="p-2 hover:bg-white/10 rounded"
    >
      {copied ? (
        <Check size={16} className="text-green-400" />
      ) : (
        <Copy size={16} className="text-slate-400" />
      )}
    </button>
  );
};

// ═══════════════════════════════════════════════════════════════
// HOST DASHBOARD
// ═══════════════════════════════════════════════════════════════

function HostDashboard({ room, onEnd }) {
  const [followUp, setFollowUp] = useState(null);
  const [reactions, setReactions] = useState([]);
  const [audioOn, setAudioOn] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const audioRef = useRef(null);
  const pcRef = useRef(null);

  useEffect(() => {
    socketRef.current.on("followup_signal", ({ speakerName }) =>
      setFollowUp(speakerName),
    );

    socketRef.current.on("reaction_received", (emoji) => {
      const id = Date.now();
      setReactions((r) => [...r, { id, emoji, left: Math.random() * 80 + 10 }]);
      setTimeout(() => setReactions((r) => r.filter((x) => x.id !== id)), 3000);
    });

    socketRef.current.on("transcript_update", (entry) =>
      setTranscript((t) => [...t.slice(-29), entry]),
    );

    socketRef.current.on("webrtc_offer", async ({ from, offer }) => {
      try {
        pcRef.current?.close();
      } catch {}
      pcRef.current = null;

      const pc = new RTCPeerConnection(RTC_CONFIG);
      pcRef.current = pc;

      pc.ontrack = (event) => {
        if (!audioRef.current) return;
        audioRef.current.srcObject = event.streams[0];
        audioRef.current.muted = !audioOn;
        if (audioOn) audioRef.current.play().catch(() => {});
      };

      pc.onicecandidate = (e) => {
        if (e.candidate)
          socketRef.current.emit("webrtc_ice", {
            to: from,
            candidate: e.candidate,
          });
      };

      try {
        await pc.setRemoteDescription(offer);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socketRef.current.emit("webrtc_answer", { to: from, answer });
      } catch {}
    });

    socketRef.current.on("webrtc_ice", async ({ candidate }) => {
      if (!pcRef.current || !candidate) return;
      try {
        if (!pcRef.current.remoteDescription) return;
        await pcRef.current.addIceCandidate(candidate);
      } catch {}
    });

    return () => {
      [
        "followup_signal",
        "reaction_received",
        "transcript_update",
        "webrtc_offer",
        "webrtc_ice",
      ].forEach((e) => socketRef.current.off(e));
      try {
        pcRef.current?.close();
      } catch {}
      pcRef.current = null;
      if (audioRef.current) audioRef.current.srcObject = null;
    };
  }, [room?.id, audioOn]);

  useEffect(() => {
    if (audioOn && audioRef.current) audioRef.current.play().catch(() => {});
  }, [audioOn]);

  const grantFloor = (userId) => {
    if (!room.currentSpeaker)
      socketRef.current.emit("grant_floor", { roomId: room.id, userId });
  };

  const endEvent = () => {
    if (confirm("End event?")) {
      socketRef.current.emit("end_event", room.id);
      onEnd();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-40">
        {reactions.map((r) => (
          <div
            key={r.id}
            className="absolute bottom-0 text-5xl"
            style={{
              left: `${r.left}%`,
              animation: "float 3s ease-out forwards",
            }}
          >
            {r.emoji}
          </div>
        ))}
      </div>

      {followUp && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full text-center">
            <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Hand size={32} className="text-black" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Follow-up Request</h2>
            <p className="text-slate-400 mb-6">
              <span className="text-cyan-400 font-bold">{followUp}</span> wants
              to continue
            </p>
            <div className="flex gap-4">
              <Button
                variant="danger"
                onClick={() => {
                  socketRef.current.emit("followup_response", {
                    roomId: room.id,
                    approved: false,
                  });
                  setFollowUp(null);
                }}
                className="flex-1"
              >
                <X size={20} /> Decline
              </Button>
              <Button
                onClick={() => {
                  socketRef.current.emit("followup_response", {
                    roomId: room.id,
                    approved: true,
                  });
                  setFollowUp(null);
                }}
                className="flex-1"
              >
                <Check size={20} /> Allow
              </Button>
            </div>
          </Card>
        </div>
      )}

      <audio ref={audioRef} autoPlay playsInline />

      <header className="h-16 bg-slate-900 border-b border-white/10 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Logo sm />
          <span className="bg-white/10 px-3 py-1 rounded font-mono text-cyan-400">
            {room.id}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={audioOn ? "primary" : "secondary"}
            size="sm"
            onClick={() => {
              setAudioOn((prev) => {
                const next = !prev;
                if (audioRef.current) {
                  audioRef.current.muted = !next;
                  if (next) audioRef.current.play().catch(() => {});
                }
                return next;
              });
            }}
          >
            {audioOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </Button>

          {room.currentSpeaker && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => socketRef.current.emit("end_speech", room.id)}
            >
              <Square size={16} />
            </Button>
          )}

          <Button variant="danger" size="sm" onClick={endEvent}>
            <Power size={16} />
          </Button>
        </div>
      </header>

      <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-auto">
        <div className="lg:col-span-4 bg-slate-900/50 rounded-xl border border-slate-800 flex flex-col">
          <div className="p-4 border-b border-white/5 flex justify-between items-center">
            <h2 className="font-bold flex items-center gap-2">
              <Users size={18} className="text-cyan-400" />
              Queue ({room.queue?.length || 0})
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {room.queue?.length === 0 ? (
              <p className="text-slate-500 text-center py-8">Empty</p>
            ) : (
              room.queue.map((u, i) => (
                <div
                  key={u.id}
                  className="bg-black/40 border border-white/10 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center text-cyan-400 font-bold">
                        {i + 1}
                      </div>
                      <span className="font-bold">{u.name}</span>
                    </div>
                    <Button
                      size="sm"
                      disabled={!!room.currentSpeaker}
                      onClick={() => grantFloor(u.id)}
                    >
                      <Play size={14} />
                    </Button>
                  </div>
                  {u.question && (
                    <div className="mt-3 bg-slate-800/50 p-3 rounded text-sm text-slate-300 border-l-2 border-cyan-500">
                      "{u.question}"
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-5 bg-slate-900/50 rounded-xl border border-slate-800 flex flex-col items-center justify-center p-8">
          {room.currentSpeaker ? (
            <div className="text-center">
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse shadow-[0_0_40px_rgba(34,197,94,0.5)]">
                <Mic size={40} />
              </div>
              <h2 className="text-3xl font-bold mb-2">
                {room.currentSpeaker.name}
              </h2>
              <p className="text-green-400 font-bold tracking-widest animate-pulse">
                LIVE
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="bg-white p-4 rounded-xl mb-6 inline-block">
                <QR value={`${window.location.origin}?room=${room.id}`} />
              </div>
              <h2 className="text-2xl font-bold mb-2">Scan to Join</h2>
              <div className="flex items-center gap-2 justify-center">
                <code className="text-cyan-400 font-mono text-xl">
                  {room.id}
                </code>
                <CopyBtn text={room.id} />
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-3 bg-slate-900/50 rounded-xl border border-slate-800 p-4 flex flex-col">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <MessageSquare size={16} className="text-cyan-400" />
            Transcript
          </h3>
          <div className="flex-1 overflow-y-auto space-y-2 max-h-80">
            {transcript.length === 0 ? (
              <p className="text-slate-500 text-sm">Waiting...</p>
            ) : (
              transcript.map((t, i) => (
                <div key={i} className="bg-black/30 rounded p-2">
                  <span className="text-cyan-400 text-xs font-bold">
                    {t.speaker}
                  </span>
                  <p className="text-sm">{t.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ATTENDEE VIEW
// ═══════════════════════════════════════════════════════════════

function AttendeeView({ room, user, onExit }) {
  const [questionText, setQuestionText] = useState("");
  const [followUpStatus, setFollowUpStatus] = useState(null);
  const [transcript, setTranscript] = useState([]);
  const pcRef = useRef(null);
  const streamRef = useRef(null);

  const inQueue = room.queue?.some((q) => q.id === socketRef.current.id);
  const queuePos =
    room.queue?.findIndex((q) => q.id === socketRef.current.id) + 1;
  const isSpeaking = room.currentSpeaker?.id === socketRef.current.id;

  const stopWebRTC = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    try {
      pcRef.current?.close();
    } catch {}
    streamRef.current = null;
    pcRef.current = null;
  };

  const startWebRTC = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const pc = new RTCPeerConnection(RTC_CONFIG);
      pcRef.current = pc;

      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          socketRef.current.emit("webrtc_ice", {
            roomId: room.id,
            candidate: e.candidate,
          });
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socketRef.current.emit("webrtc_offer", { roomId: room.id, offer });
    } catch (e) {
      alert("Microphone required");
    }
  };

  useEffect(() => {
    socketRef.current.on("floor_granted", startWebRTC);

    socketRef.current.on("followup_approved", () =>
      setFollowUpStatus("approved"),
    );
    socketRef.current.on("followup_declined", () => {
      setFollowUpStatus("declined");
      setTimeout(() => setFollowUpStatus(null), 3000);
    });

    socketRef.current.on("transcript_update", (entry) =>
      setTranscript((t) => [...t.slice(-29), entry]),
    );

    socketRef.current.on("webrtc_answer", async ({ answer }) => {
      if (!pcRef.current) return;
      try {
        await pcRef.current.setRemoteDescription(answer);
      } catch {}
    });

    socketRef.current.on("webrtc_ice", async ({ candidate }) => {
      if (!pcRef.current || !candidate) return;
      try {
        if (!pcRef.current.remoteDescription) return;
        await pcRef.current.addIceCandidate(candidate);
      } catch {}
    });

    return () => {
      [
        "floor_granted",
        "followup_approved",
        "followup_declined",
        "transcript_update",
        "webrtc_answer",
        "webrtc_ice",
      ].forEach((e) => socketRef.current.off(e));
      stopWebRTC();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.id]);

  const endTurn = () => {
    socketRef.current.emit("end_speech", room.id);
    stopWebRTC();
  };

  if (isSpeaking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 to-green-800 text-white flex flex-col items-center justify-center p-6">
        <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-6 animate-pulse">
          <Mic size={60} className="text-green-600" />
        </div>
        <h2 className="text-4xl font-black mb-2">YOU ARE LIVE</h2>
        <p className="text-green-200 mb-8">Your voice is streaming</p>

        {followUpStatus === "pending" && (
          <div className="bg-yellow-500/20 border border-yellow-500 rounded-xl p-4 mb-4">
            Waiting...
          </div>
        )}
        {followUpStatus === "approved" && (
          <div className="bg-green-500/30 border border-green-400 rounded-xl p-4 mb-4">
            Follow-up approved!
          </div>
        )}
        {followUpStatus === "declined" && (
          <div className="bg-red-500/30 border border-red-400 rounded-xl p-4 mb-4">
            Declined
          </div>
        )}

        <div className="space-y-4 w-full max-w-xs">
          {followUpStatus !== "pending" && (
            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                socketRef.current.emit("signal_followup", room.id);
                setFollowUpStatus("pending");
              }}
              className="w-full bg-yellow-500 text-black hover:bg-yellow-400"
            >
              <Hand size={24} /> Follow-up
            </Button>
          )}

          <Button
            variant="secondary"
            size="lg"
            onClick={endTurn}
            className="w-full"
          >
            <Square size={24} /> Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <header className="p-4 border-b border-white/10 bg-slate-900 flex justify-between items-center">
        <div>
          <h1 className="font-bold">{room.name}</h1>
          <p className="text-xs text-slate-400">
            {room.currentSpeaker
              ? `${room.currentSpeaker.name} speaking`
              : "Stage empty"}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onExit}>
          Exit
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        {inQueue ? (
          <div className="max-w-md mx-auto text-center">
            <div className="text-8xl font-black text-cyan-500 mb-2">
              {queuePos}
            </div>
            <p className="text-lg font-bold tracking-widest text-slate-300 mb-8">
              IN QUEUE
            </p>

            <div className="bg-slate-800 p-4 rounded-xl mb-6 text-left">
              <label className="text-sm text-slate-400 mb-2 block">
                Your question
              </label>
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                className="w-full bg-black/50 rounded p-3 text-sm outline-none border border-slate-700 focus:border-cyan-500"
                rows={3}
              />
              <Button
                size="sm"
                onClick={() => {
                  socketRef.current.emit("submit_question", {
                    roomId: room.id,
                    text: questionText,
                  });
                  setQuestionText("");
                }}
                className="w-full mt-2"
              >
                <Send size={14} /> Send
              </Button>
            </div>

            <Button
              variant="ghost"
              onClick={() => socketRef.current.emit("leave_queue", room.id)}
            >
              Leave Queue
            </Button>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl mb-6 text-center">
              <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold text-cyan-400">
                {user.name?.[0] || "?"}
              </div>
              <h3 className="font-bold text-xl">{user.name}</h3>
            </div>

            <Button
              size="lg"
              onClick={() =>
                socketRef.current.emit("join_queue", { roomId: room.id, user })
              }
              className="w-full mb-8 py-6"
            >
              <Mic size={24} /> Join Queue
            </Button>

            <div className="text-center mb-8">
              <p className="text-xs text-slate-500 uppercase mb-4">React</p>
              <div className="flex justify-center gap-3">
                {["🔥", "❤️", "👍", "👏", "🎉", "💡"].map((e) => (
                  <button
                    key={e}
                    onClick={() =>
                      socketRef.current.emit("send_reaction", {
                        roomId: room.id,
                        emoji: e,
                      })
                    }
                    className="w-12 h-12 bg-slate-800 rounded-full text-2xl hover:bg-slate-700 active:scale-90 transition"
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
              <h3 className="font-bold mb-3 text-sm">
                <MessageSquare
                  size={14}
                  className="inline mr-2 text-cyan-400"
                />
                Transcript
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {transcript.length === 0 ? (
                  <p className="text-slate-500 text-xs">Waiting...</p>
                ) : (
                  transcript.map((t, i) => (
                    <div key={i} className="text-xs">
                      <span className="text-cyan-400">{t.speaker}:</span>{" "}
                      {t.text}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// AUTH PAGES
// ═══════════════════════════════════════════════════════════════

function LoginPage({ onBack, onSwitch }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <button
          onClick={onBack}
          className="mb-6 text-slate-500 hover:text-white flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <Logo />
        <p className="text-slate-400 mt-2 mb-6">Welcome back</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded p-3 mb-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="text-center text-slate-500 mt-6">
          No account?{" "}
          <button onClick={onSwitch} className="text-cyan-400 hover:underline">
            Sign up
          </button>
        </p>

        <p className="text-center text-slate-600 text-sm mt-4">
          Demo: admin@speakapp.io / admin123
        </p>
      </Card>
    </div>
  );
}

function RegisterPage({ onBack, onSwitch }) {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(name, email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <button
          onClick={onBack}
          className="mb-6 text-slate-500 hover:text-white flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <Logo />
        <p className="text-slate-400 mt-2 mb-6">Create account</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded p-3 mb-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating..." : "Create Account"}
          </Button>
        </form>

        <p className="text-center text-slate-500 mt-6">
          Have account?{" "}
          <button onClick={onSwitch} className="text-cyan-400 hover:underline">
            Sign in
          </button>
        </p>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ADMIN DASHBOARD
// ═══════════════════════════════════════════════════════════════

function AdminDashboard({ onBack }) {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch(`${BACKEND}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, [token]);

  if (!stats)
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="h-16 bg-slate-900 border-b border-white/10 flex items-center justify-between px-6">
        <Logo sm />
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft size={16} />
          Back
        </Button>
      </header>

      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Users, label: "Users", value: stats.totalUsers },
            { icon: Monitor, label: "Events", value: stats.totalEvents },
            { icon: TrendingUp, label: "Active", value: stats.activeEvents },
            {
              icon: MessageSquare,
              label: "Questions",
              value: stats.totalQuestions || 0,
            },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="bg-slate-800/50 border border-white/10 rounded-xl p-4"
            >
              <Icon size={20} className="text-cyan-400 mb-2" />
              <div className="text-2xl font-bold">{value}</div>
              <div className="text-sm text-slate-400">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SETUP PAGES
// ═══════════════════════════════════════════════════════════════

function HostSetup({ onBack, onCreate, connected }) {
  const [name, setName] = useState("");
  const [hostName, setHostName] = useState("");

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Status connected={connected} />
      <Card className="max-w-md w-full">
        <button
          onClick={onBack}
          className="mb-6 text-slate-500 hover:text-white flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <h2 className="text-2xl font-bold mb-2">Create Event</h2>
        <p className="text-slate-400 mb-6">Set up your Q&A session</p>

        <div className="space-y-4">
          <Input
            label="Event Name"
            placeholder="Tech Talk 2025"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Your Name"
            placeholder="John Smith"
            value={hostName}
            onChange={(e) => setHostName(e.target.value)}
          />
          <Button
            onClick={() =>
              name.trim()
                ? onCreate({ name, hostName: hostName || "Host" })
                : alert("Enter event name")
            }
            className="w-full"
            size="lg"
          >
            <Play size={20} /> Launch
          </Button>
        </div>
      </Card>
    </div>
  );
}

function JoinPage({ onBack, onJoin, connected }) {
  const params = new URLSearchParams(window.location.search);
  const [code, setCode] = useState(params.get("room") || "");
  const [name, setName] = useState("");
  const [skip, setSkip] = useState(false);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Status connected={connected} />
      <Card className="max-w-md w-full">
        <button
          onClick={onBack}
          className="mb-6 text-slate-500 hover:text-white flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <h2 className="text-2xl font-bold mb-2">Join Event</h2>
        <p className="text-slate-400 mb-6">Enter room code</p>

        <div className="space-y-4">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="w-full bg-white/10 border border-white/20 p-4 text-center text-3xl font-mono uppercase text-white rounded-lg outline-none focus:border-cyan-500"
            placeholder="CODE"
            maxLength={4}
          />

          {!skip && (
            <Input
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}

          <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={skip}
              onChange={(e) => setSkip(e.target.checked)}
              className="w-4 h-4"
            />
            Join anonymously
          </label>

          <Button
            onClick={() => {
              if (!code.trim()) return alert("Enter code");
              const userName = skip
                ? `Guest_${Math.random().toString(36).slice(2, 6)}`
                : name;
              if (!skip && !userName.trim()) return alert("Enter name");
              onJoin(code, { name: userName });
            }}
            className="w-full"
            size="lg"
          >
            Enter
          </Button>
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════

function App() {
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(BACKEND, {
        transports: ["websocket", "polling"],
        reconnection: true,
      });
    }
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  const [view, setView] = useState("landing");
  const [room, setRoom] = useState(null);
  const [attendeeUser, setAttendeeUser] = useState({ name: "" });
  // const [connected, setConnected] = useState(false);

  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;

    setConnected(s.connected);

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);

    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
    };
  }, []);

  /* useEffect(() => {
    socketRef.current.on("connect", () => setConnected(true));
    socketRef.current.on("disconnect", () => setConnected(false));

    socketRef.current.on("event_created", (r) => {
      setRoom(r);
      setView("host");
    });

    socketRef.current.on("room_data", setRoom);

    socketRef.current.on("event_ended", () => {
      alert("Event ended");
      setView("landing");
      setRoom(null);
    });

    socketRef.current.on("error", alert);

    const params = new URLSearchParams(window.location.search);
    if (params.get("room")) setView("join");

    return () => {
      socketRef.current.off("connect");
      socketRef.current.off("disconnect");
      socketRef.current.off("event_created");
      socketRef.current.off("room_data");
      socketRef.current.off("event_ended");
      socketRef.current.off("error");
    };
  }, []);*/

  const createEvent = (data) => {
    if (connected) socketRef.current.emit("create_event", data);
    else alert("Not connected");
  };

  const joinEvent = (code, user) => {
    if (!connected) return alert("Not connected");
    setAttendeeUser(user);
    socketRef.current.emit("join_room_attendee", {
      roomId: code.toUpperCase(),
      user,
    });
    setView("attendee");
  };

  return (
    <AuthProvider>
      <AppRoutes
        view={view}
        setView={setView}
        room={room}
        attendeeUser={attendeeUser}
        connected={connected}
        createEvent={createEvent}
        joinEvent={joinEvent}
      />
    </AuthProvider>
  );
}

function AppRoutes({
  view,
  setView,
  room,
  attendeeUser,
  connected,
  createEvent,
  joinEvent,
}) {
  const { user, logout } = useAuth();

  if (view === "landing") {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <Status connected={connected} />

        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />

        <nav className="absolute top-0 w-full p-6 flex justify-between items-center z-10">
          <Logo />
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {["admin", "superadmin"].includes(user.role) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setView("admin")}
                  >
                    <BarChart3 size={16} />
                  </Button>
                )}
                <span className="text-slate-400 text-sm">{user.name}</span>
                <Button variant="ghost" size="sm" onClick={logout}>
                  <LogOut size={16} />
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setView("login")}
              >
                <LogIn size={16} /> Login
              </Button>
            )}
          </div>
        </nav>

        <div className="relative z-10 text-center max-w-2xl">
          <div className="inline-block px-4 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase mb-6">
            Live Q&A Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">
            Speak
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
              App
            </span>
          </h1>

          <p className="text-xl text-slate-400 mb-10">
            Real-time conference Q&A with WebRTC audio streaming
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => setView("setup")}>
              <Monitor size={20} /> Host Event
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => setView("join")}
            >
              <Smartphone size={20} /> Join Event
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (view === "setup")
    return (
      <HostSetup
        onBack={() => setView("landing")}
        onCreate={createEvent}
        connected={connected}
      />
    );

  if (view === "host" && room)
    return <HostDashboard room={room} onEnd={() => setView("landing")} />;

  if (view === "join")
    return (
      <JoinPage
        onBack={() => setView("landing")}
        onJoin={joinEvent}
        connected={connected}
      />
    );

  if (view === "attendee" && room)
    return (
      <AttendeeView
        room={room}
        user={attendeeUser}
        onExit={() => setView("landing")}
      />
    );

  if (view === "login")
    return (
      <LoginPage
        onBack={() => setView("landing")}
        onSwitch={() => setView("register")}
      />
    );

  if (view === "register")
    return (
      <RegisterPage
        onBack={() => setView("landing")}
        onSwitch={() => setView("login")}
      />
    );

  if (view === "admin") {
    if (!user || !["admin", "superadmin"].includes(user.role))
      return (
        <LoginPage
          onBack={() => setView("landing")}
          onSwitch={() => setView("register")}
        />
      );
    return <AdminDashboard onBack={() => setView("landing")} />;
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
      Loading...
    </div>
  );
}

export default App;
