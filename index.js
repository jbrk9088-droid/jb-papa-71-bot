import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} from "@whiskeysockets/baileys"

import express from "express"
import P from "pino"

const app = express()
const PORT = process.env.PORT || 3000

// ====== BOT SETTINGS ======
const BOT_NAME = "JB PAPA 71"
const OWNER_NAME = "JB"
const OWNER_NUMBER = "YOUR_NUMBER_HERE" // country code ছাড়া শুধু নাম্বার লিখবে
const PREFIX = "."
// ===========================

app.get("/", (req, res) => {
  res.send("JB PAPA 71 Bot is Running 🚀")
})

app.listen(PORT, () => console.log("Server running on port", PORT))

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth")

  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    logger: P({ level: "silent" }),
    auth: state,
    browser: ["JB PAPA 71", "Chrome", "1.0"]
  })

  sock.ev.on("creds.update", saveCreds)

  // Pair Code System
  if (!sock.authState.creds.registered) {
    const number = OWNER_NUMBER
    const code = await sock.requestPairingCode(number)
    console.log("Your Pair Code:", code)
  }

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message) return

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text

    if (!text.startsWith(PREFIX)) return

    const from = msg.key.remoteJid
    const command = text.slice(1).split(" ")[0].toLowerCase()
    const args = text.split(" ").slice(1)

    // ===== COMMANDS =====

    if (command === "ping") {
      await sock.sendMessage(from, { text: "🏓 Pong!" })
    }

    if (command === "owner") {
      await sock.sendMessage(from, {
        text: `👑 Owner: ${OWNER_NAME}`
      })
    }

    if (command === "tagall") {
      const group = await sock.groupMetadata(from)
      const participants = group.participants
      let teks = "📢 Tagging All:\n\n"
      participants.forEach(p => {
        teks += `@${p.id.split("@")[0]}\n`
      })
      await sock.sendMessage(from, {
        text: teks,
        mentions: participants.map(p => p.id)
      })
    }

    if (command === "welcome") {
      await sock.sendMessage(from, {
        text: "👋 Welcome to JB PAPA 71 Group!"
      })
    }
  })

  sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect.error?.output?.statusCode !==
        DisconnectReason.loggedOut
      if (shouldReconnect) startBot()
    } else if (connection === "open") {
      console.log("✅ JB PAPA 71 Connected Successfully!")
    }
  })
}

startBot()
