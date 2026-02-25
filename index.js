const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const fs = require("fs");

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");

  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: "silent" }),
    auth: state,
    browser: ["JB-PAPA-71", "Chrome", "1.0"]
  });

  // 🔐 Pair System
  if (!sock.authState.creds.registered) {
    const number = "91XXXXXXXXXX"; // এখানে নিজের নাম্বার দাও
    const code = await sock.requestPairingCode(number);
    console.log("🔥 YOUR PAIR CODE:", code);
  }

  sock.ev.on("creds.update", saveCreds);

  // 📩 Message System
  sock.ev.on("messages.upsert", async (msg) => {
    const m = msg.messages[0];
    if (!m.message) return;

    const from = m.key.remoteJid;
    const text =
      m.message.conversation ||
      m.message.extendedTextMessage?.text ||
      "";

    // 📌 MENU COMMAND
    if (text.toLowerCase() === ".menu") {
      await sock.sendMessage(from, {
        image: { url: "https://files.catbox.moe/5ognk5.png" }, // নিজের ছবি লিংক দাও
        caption: `👑 JB PAPA 71 ☠️ BOT MENU

📌 Available Commands:

.menu - Show Menu
.ping - Check Bot
.channel - WhatsApp Channel

🔥 Owner: JB PAPA 71`
      });
    }

    // 📌 CHANNEL BUTTON
    if (text.toLowerCase() === "https://whatsapp.com/channel/0029Vb69yTi5PO0rX16dFQ1L") {
      await sock.sendMessage(from, {
        text: "📢 Join Our Official WhatsApp Channel 👇",
        footer: "JB PAPA 71",
        buttons: [
          {
            buttonId: "channel",
            buttonText: { displayText: "📢 Join Channel" },
            type: 1
          }
        ],
        headerType: 1
      });
    }

    // 📌 PING
    if (text.toLowerCase() === ".ping") {
      await sock.sendMessage(from, { text: "🏓 Pong! Bot is Alive 🔥" });
    }
  });
}

startBot();
