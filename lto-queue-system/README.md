# 🚦 LTO Calapan Queue Management System

A full-featured web-based queue management system for the Land Transportation Office – Calapan City District Office. Built with Node.js, Express, and Socket.io for real-time multi-computer operation over a local network.

---

## 📁 File Structure

```
lto-queue-system/
├── server.js              ← Main server (run this)
├── package.json           ← Dependencies
├── README.md              ← This file
└── public/
    ├── index.html         ← Home / module selector
    ├── kiosk.html         ← Client kiosk (ticket machine)
    ├── board.html         ← Queue display board (TV/monitor)
    ├── counter.html       ← Staff counter / window interface
    └── admin.html         ← Admin panel (reports & reset)
```

---

## 💻 Requirements

- **Node.js** version 16 or higher  
  Download: https://nodejs.org/

- **All computers on the same local network (LAN)**
- One computer acts as the **server** (can also run a kiosk or admin)

---

## ⚙️ Setup & Installation

### Step 1 — Install Node.js
Download and install Node.js from https://nodejs.org/ on the server computer.

### Step 2 — Copy the project folder
Copy the `lto-queue-system` folder to the server computer (e.g., Desktop).

### Step 3 — Install dependencies
Open a **Command Prompt** or **Terminal** inside the project folder and run:
```
npm install
```

### Step 4 — Start the server
```
node server.js
```
You will see a message showing the server is running on port 3000.

### Step 5 — Find the server's IP address
On the server computer, open Command Prompt and run:
```
ipconfig
```
Look for **IPv4 Address** (e.g., `192.168.1.10`)

### Step 6 — Access from all computers
On any computer connected to the same network, open a web browser and go to:
```
http://192.168.1.10:3000
```
(Replace `192.168.1.10` with your actual server IP)

---

## 🖥️ Which Page Opens on Which Computer?

| Computer | URL | Purpose |
|---|---|---|
| Kiosk (touch screen) | `http://SERVER-IP:3000/kiosk.html` | Clients select transaction & print ticket |
| Queue Board (TV) | `http://SERVER-IP:3000/board.html` | Shows "Now Serving" numbers |
| Each Counter PC | `http://SERVER-IP:3000/counter.html` | Staff calls clients, verifies docs |
| Admin PC | `http://SERVER-IP:3000/admin.html` | Reports, statistics, system reset |

---

## 🏷️ Ticket Number Format

| Transaction | Regular | Priority |
|---|---|---|
| Driver's License Renewal | `DL-001` | `PDL-001` |
| MV Registration Renewal  | `MV-001` | `PMV-001` |
| OR/CR Replacement         | `OR-001` | `POR-001` |
| Change of MV Color        | `CC-001` | `PCC-001` |
| Transfer of Ownership     | `TO-001` | `PTO-001` |

---

## 🔄 Workflow / Transaction Steps

| Transaction | Steps |
|---|---|
| DL Renewal | CSR → Encoding → Cashier → Written Exam → Photo & Bio → Releasing |
| MV Registration | CSR → MV Inspection → Encoding → Cashier → Releasing |
| OR/CR Replacement | CSR → Encoding → Cashier → Releasing |
| MV Color Change | CSR → MV Inspection → Encoding → Cashier → Releasing |
| Transfer of Ownership | CSR → MV Inspection → Encoding → Cashier → Releasing |

---

## 🎯 Counter Staff Guide

1. Open `counter.html` on your workstation
2. **Select your window number** (1–8) and **station type** (CSR, Encoding, etc.)
3. Click **"Start Session"**
4. Click **"Call Next Client"** to serve the next in queue
5. **Verify requirements** using the on-screen checklist
6. Click **"Complete & Forward"** → ticket advances to the next step
7. Or **"Return"** if documents are incomplete
8. Or **"No Show"** if the client doesn't come

---

## 📺 Queue Board Guide

1. Open `board.html` on the TV/monitor computer
2. **Make it fullscreen** by pressing `F11`
3. The board will automatically show:
   - Which ticket is being served at each window
   - Number of clients waiting per station
   - Audio announcements when numbers are called
4. Audio uses the computer's built-in text-to-speech (make sure volume is on)

---

## 🖨️ Kiosk / Ticket Printing

1. Connect a **receipt printer** or regular printer to the kiosk PC
2. After a client selects their transaction, click **"Print Ticket"**
3. The browser print dialog will open — select the connected printer
4. For best results, use a **thermal receipt printer** with 80mm paper
5. Set the browser print margins to "None" / "Minimum"

---

## ⚠️ End of Day Reset

1. Open `admin.html`
2. Click **"Reset System (End of Day)"**
3. This clears all tickets and resets all counters to zero
4. **This cannot be undone** — do this only at end of day

---

## 🛠️ Troubleshooting

| Problem | Solution |
|---|---|
| Can't connect from other computers | Make sure Windows Firewall allows port 3000 |
| No audio on Queue Board | Make sure browser allows audio; click anywhere on the board page first |
| Printer not printing | Use `Ctrl+P` in browser, select the correct printer |
| Server stops | Restart by running `node server.js` again in the project folder |
| Data lost after restart | This is expected — the system uses in-memory storage; data resets each run |

### Allow Port 3000 through Windows Firewall:
1. Open Windows Defender Firewall
2. Click "Advanced settings"
3. Click "Inbound Rules" → "New Rule"
4. Select "Port" → TCP → Specific port: `3000`
5. Allow the connection → Apply to all profiles → Name it "LTO Queue System"

---

## 📞 Technical Specifications

- **Backend:** Node.js + Express.js + Socket.io
- **Frontend:** Plain HTML5 + CSS3 + Vanilla JavaScript
- **Real-time:** WebSocket via Socket.io
- **Data storage:** In-memory (resets on server restart)
- **Network:** LAN/WiFi (all devices must be on same network)
- **Recommended browser:** Google Chrome (latest)

---

*Developed for LTO Calapan City District Office*
