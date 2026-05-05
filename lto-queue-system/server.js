const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://lto-pink.vercel.app",
    methods: ["GET", "POST"]
  },
  pingInterval: 20000,
  pingTimeout: 5000,
  transports: ['websocket', 'polling']
});

app.use(express.json());
app.use((req, res, next) => { res.header('Access-Control-Allow-Origin', '*'); res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); res.header('Access-Control-Allow-Headers', 'Content-Type'); next(); });
app.use(express.static(path.join(__dirname, 'public')));

// ─── CATEGORIES & SUB-TRANSACTIONS ────────────────────────────────────────────
const CATEGORIES = {
  DL: {
    name: "Driver's License & Permits",
    icon: "🪪",
    color: "#1565C0",
    subTransactions: {
      SP: { name: "Student Permit", short: "Student Permit", code: "SP", steps: ["CSR", "MEDICAL", "EVAL", "RELEASING"], stepNames: ["Doc Check", "Medical", "Evaluation", "Permit Release"] },
      NA: { name: "New Non-Professional", short: "New Non-Pro", code: "NA", steps: ["CSR", "MEDICAL", "THEORY", "PRACTICAL", "BIO", "CASHIER", "RELEASING"], stepNames: ["Docs", "Medical", "Theory", "Practical", "Bio", "Cashier", "License"] },
      NP: { name: "New Professional", short: "New Pro", code: "NP", steps: ["CSR", "MEDICAL", "THEORY", "PRACTICAL", "BIO", "CASHIER", "RELEASING"], stepNames: ["Docs", "Medical", "Theory", "Practical", "Bio", "Cashier", "License"] },
      RN: { name: "Renewal (No Exam)", short: "Renewal No Exam", code: "RN", steps: ["CSR", "MEDICAL", "ENCODING", "PHOTO_BIO", "CASHIER", "RELEASING"], stepNames: ["Docs", "Medical", "Encoding", "Photo/Bio", "Cashier", "Release"] },
      RE: { name: "Renewal (With Exam)", short: "Renewal w/ Exam", code: "RE", steps: ["CSR", "MEDICAL", "EXAM", "ENCODING", "PHOTO_BIO", "CASHIER", "RELEASING"], stepNames: ["Docs", "Medical", "Exam", "Encoding", "Photo/Bio", "Cashier", "Release"] },
      DU: { name: "Duplicate (Lost)", short: "Duplicate DL", code: "DU", steps: ["CSR", "ENCODING", "PHOTO_BIO", "CASHIER", "RELEASING"], stepNames: ["Docs", "Encoding", "Photo", "Cashier", "Release"] },
      CV: { name: "Conversion (Foreign)", short: "License Conversion", code: "CV", steps: ["CSR", "VERIFY", "EXAM", "ENCODING", "PHOTO_BIO", "CASHIER", "RELEASING"], stepNames: ["Docs", "Verify", "Exam", "Encoding", "Photo/Bio", "Cashier", "Release"] }
    }
  },
  MV: {
    name: "Vehicle Registration",
    icon: "🚗",
    color: "#0277BD",
    subTransactions: {
      NR: { name: "New Registration", short: "New Reg", code: "NR", steps: ["CSR", "INSPECT", "ENCODING", "CASHIER", "RELEASING"], stepNames: ["Docs", "Inspection", "Encoding", "Cashier", "Release"] },
      MR: { name: "Renewal", short: "MV Renewal", code: "MR", steps: ["CSR", "INSPECT", "EMISSION", "ENCODING", "CASHIER", "RELEASING"], stepNames: ["Docs", "Inspect", "Emission", "Encoding", "Cashier", "Release"] },
      ST: { name: "Stickers Only", short: "Stickers", code: "ST", steps: ["CSR", "CASHIER", "RELEASING"], stepNames: ["Docs", "Cashier", "Stickers"] },
      DR: { name: "Duplicate OR/CR", short: "Dup OR/CR", code: "DR", steps: ["CSR", "VERIFY", "ENCODING", "CASHIER", "RELEASING"], stepNames: ["Docs", "Verify", "Encoding", "Cashier", "Release"] }
    }
  },
  OC: {
    name: "Ownership Changes",
    icon: "🔄",
    color: "#1B5E20",
    subTransactions: {
      TO: { name: "Transfer Ownership", short: "Transfer", code: "TO", steps: ["CSR", "INSPECT", "VERIFY", "ENCODING", "CASHIER", "RELEASING"], stepNames: ["Docs", "Inspect", "Verify", "Encoding", "Cashier", "Release"] },
      MO: { name: "Mortgage Annot/Cancel", short: "Mortgage", code: "MO", steps: ["CSR", "VERIFY", "ENCODING", "CASHIER", "RELEASING"], stepNames: ["Docs", "Verify", "Encoding", "Cashier", "Release"] }
    }
  },
  MS: {
    name: "Miscellaneous",
    icon: "📄",
    color: "#006064",
    subTransactions: {
      CR: { name: "Change Records", short: "Change Rec", code: "CR", steps: ["CSR", "VERIFY", "ENCODING", "CASHIER", "RELEASING"], stepNames: ["Docs", "Verify", "Encoding", "Cashier", "Release"] },
      AN: { name: "Annotation", short: "Annotation", code: "AN", steps: ["CSR", "VERIFY", "CASHIER", "RELEASING"], stepNames: ["Docs", "Verify", "Cashier", "Release"] }
    }
  },
  LE: {
    name: "Law Enforcement",
    icon: "⚖️",
    color: "#E65100",
    subTransactions: {
      VS: { name: "Violation Settlement", short: "Violation", code: "VS", steps: ["CSR", "REVIEW", "CASHIER", "RELEASING"], stepNames: ["Docs", "Review", "Cashier", "Release"] },
      AL: { name: "Alarm Lifting", short: "Alarm Lift", code: "AL", steps: ["CSR", "REVIEW", "CASHIER", "RELEASING"], stepNames: ["Docs", "Review", "Cashier", "Release"] }
    }
  }
};

const CHECKLISTS = {
  CSR: ["Valid ID", "Application Form", "Complete Requirements"],
  MEDICAL: ["Medical Certificate (accredited clinic)", "Valid within 30 days"],
  EVAL: ["Documents verified", "LTMS account checked", "Fees computed"],
  THEORY: ["Theory exam passed", "70% score"],
  PRACTICAL: ["Practical driving test passed"],
  INSPECT: ["Vehicle inspection passed", "Chassis/Engine verified"],
  EMISSION: ["PETC valid", "Within 30 days"],
  VERIFY: ["Legal docs verified", "Signatures authentic"],
  ENCODING: ["Data encoded correctly", "System validated"],
  REVIEW: ["Violation documents complete", "Clearance eligible"],
  PHOTO_BIO: ["Photo & biometrics captured", "Signature digital"],
  CASHIER: ["Fees paid", "OR issued"],
  RELEASING: ["Documents printed", "Quality check passed", "Client receipt"]
};

const STATIONS = {
  CSR: { name: "CSR – Document Checking", short: "CSR", color: "#1565C0" },
  MEDICAL: { name: "Medical Certificate", short: "MED", color: "#FF5722" },
  EVAL: { name: "Evaluation", short: "EVAL", color: "#2196F3" },
  THEORY: { name: "Theory Exam", short: "THRY", color: "#4CAF50" },
  PRACTICAL: { name: "Practical Driving", short: "PRAC", color: "#FF9800" },
  INSPECT: { name: "Vehicle Inspection", short: "INSP", color: "#2E7D32" },
  EMISSION: { name: "Emission Testing", short: "EMIS", color: "#795548" },
  VERIFY: { name: "Document Verification", short: "VER", color: "#9C27B0" },
  ENCODING: { name: "Encoding", short: "ENC", color: "#0277BD" },
  REVIEW: { name: "Case Review", short: "REV", color: "#E65100" },
  PHOTO_BIO: { name: "Photo & Biometrics", short: "BIO", color: "#6A1B9A" },
  CASHIER: { name: "Cashier", short: "CASH", color: "#00695C" },
  RELEASING: { name: "Releasing", short: "REL", color: "#4527A0" }
};

// ─── IN-MEMORY STATE ──────────────────────────────────────────────────────────
const officeStates = {};
function getOfficeState(officeId) {
  if (!officeStates[officeId]) officeStates[officeId] = { tickets: [], counters: {}, ticketCounters: {} };
  return officeStates[officeId];
}

function resetState(officeId) {
  officeStates[officeId] = { tickets: [], counters: {}, ticketCounters: {} };
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function generateTicketNumber(subCode, isPriority, officeId) {
  const state = getOfficeState(officeId);
  const prefix = isPriority ? `P${subCode}` : subCode;
  if (!state.ticketCounters[prefix]) state.ticketCounters[prefix] = 0;
  state.ticketCounters[prefix]++;
  return `${prefix}-${String(state.ticketCounters[prefix]).padStart(3, '0')}`;
}

function getNextTicketForStation(stationType) {
  const waiting = state.tickets.filter(t => t.status === 'WAITING' && t.steps[t.currentStepIndex] === stationType);
  const priority = waiting.filter(t => t.isPriority).sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
  const regular = waiting.filter(t => !t.isPriority).sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
  return [...priority, ...regular][0] || null;
}

function getQueueState(officeId) {
  const state = getOfficeState(officeId);
  const active = state.tickets.filter(t => !['COMPLETED','NO_SHOW'].includes(t.status));
  const nowServing = {};
  Object.entries(state.counters).forEach(([wId, c]) => {
    if (c.currentTicket) {
      const ticket = state.tickets.find(t => t.id === c.currentTicket);
      nowServing[wId] = { ...c, windowId: wId, ticket };
    }
  });
  const waitingByStation = {};
  Object.keys(STATIONS).forEach(st => {
    waitingByStation[st] = active.filter(t => t.status === 'WAITING' && t.steps[t.currentStepIndex] === st).length;
  });
  return {
    tickets: active,
    allTickets: state.tickets, officeId,
    nowServing,
    waitingByStation,
    counters: state.counters,
    categories: CATEGORIES,
    stations: STATIONS,
    totalToday: state.tickets.length,
    completedToday: state.tickets.filter(t => t.status === 'COMPLETED').length,
    waitingToday: state.tickets.filter(t => t.status === 'WAITING').length,
    servingToday: state.tickets.filter(t => t.status === 'SERVING').length
  };
}

function broadcast(officeId) {
  io.to(officeId).emit('queue-updated', getQueueState(officeId));
}

// ─── API ROUTES ───────────────────────────────────────────────────────────────
app.get('/api/config', (req, res) => res.json({ CATEGORIES, STATIONS, CHECKLISTS }));
app.get('/api/queue', (req, res) => { const officeId = req.query.office || 'DEFAULT'; res.json(getQueueState(officeId)); });

app.post('/api/ticket', (req, res) => {
  const officeId = req.body.office || 'DEFAULT';
  const state = getOfficeState(officeId);
  const { category, subType, priorityType } = req.body;
  const cat = CATEGORIES[category];
  const tx = cat?.subTransactions[subType];
  if (!tx) return res.status(400).json({ error: 'Invalid category/subType' });

  const isPriority = !!priorityType && priorityType !== 'REGULAR';
  const ticketId = generateTicketNumber(tx.code, isPriority);

  const ticket = {
    id: ticketId,
    category,
    subType,
    transactionName: tx.name,
    transactionShort: tx.shortName,
    priority: priorityType || 'REGULAR',
    isPriority,
    currentStepIndex: 0,
    steps: [...tx.steps],
    stepNames: [...tx.stepNames],
    status: 'WAITING',
    currentWindow: null,
    checklist: {},
    createdAt: new Date().toISOString(),
    history: []
  };

  state.tickets.push(ticket);
  broadcast(officeId);

  const posInQueue = state.tickets.filter(t =>
    t.status === 'WAITING' &&
    t.steps[t.currentStepIndex] === tx.steps[0] &&
    t.createdAt <= ticket.createdAt
  ).length;

  res.json({ ticket, position: posInQueue });
});

app.post('/api/counter/call-next', (req, res) => {
  const officeId = req.body.office || 'DEFAULT';
  const state = getOfficeState(officeId);
  const { windowId, stationType } = req.body;
  const next = getNextTicketForStation(stationType);
  if (!next) return res.json({ ticket: null });

  next.status = 'SERVING';
  next.currentWindow = windowId;
  next.calledAt = new Date().toISOString();
  next.history.push({ action: 'CALLED', windowId, stationType, at: new Date().toISOString() });

  state.counters[windowId] = { ...(state.counters[windowId] || {}), stationType, currentTicket: next.id, isOnline: true };

  io.to(officeId).emit('ticket-called', { ticket: next, windowId, stationType });
  broadcast(officeId);
  res.json({ ticket: next });
});

app.post('/api/counter/complete', (req, res) => {
  const officeId = req.body.office || 'DEFAULT';
  const state = getOfficeState(officeId);
  const { windowId, ticketId, checklistData } = req.body;
  const ticket = state.tickets.find(t => t.id === ticketId);
  if (!ticket) return res.status(404).json({ error: 'Not found' });

  const currentStep = ticket.steps[ticket.currentStepIndex];
  ticket.checklist[currentStep] = checklistData || {};
  ticket.history.push({ action: 'STEP_DONE', step: currentStep, windowId, at: new Date().toISOString() });
  ticket.currentStepIndex++;

  if (ticket.currentStepIndex >= ticket.steps.length) {
    ticket.status = 'COMPLETED';
    ticket.completedAt = new Date().toISOString();
  } else {
    ticket.status = 'WAITING';
  }

  ticket.currentWindow = null;
  delete state.counters[windowId]?.currentTicket;

  broadcast(officeId);
  res.json({ ticket });
});

app.post('/api/counter/return', (req, res) => {
  const officeId = req.body.office || 'DEFAULT';
  const state = getOfficeState(officeId);
  const { windowId, ticketId, reason } = req.body;
  const ticket = state.tickets.find(t => t.id === ticketId);
  if (!ticket) return res.status(404).json({ error: 'Not found' });

  ticket.status = 'ON_HOLD';
  ticket.currentWindow = null;
  ticket.history.push({ action: 'RETURNED', reason, windowId, at: new Date().toISOString() });
  delete state.counters[windowId]?.currentTicket;

  broadcast(officeId);
  res.json({ ticket });
});

app.post('/api/counter/no-show', (req, res) => {
  const officeId = req.body.office || 'DEFAULT';
  const state = getOfficeState(officeId);
  const { windowId, ticketId } = req.body;
  const ticket = state.tickets.find(t => t.id === ticketId);
  if (!ticket) return res.status(404).json({ error: 'Not found' });

  ticket.status = 'NO_SHOW';
  ticket.currentWindow = null;
  ticket.history.push({ action: 'NO_SHOW', windowId, at: new Date().toISOString() });
  delete state.counters[windowId]?.currentTicket;

  broadcast(officeId);
  res.json({ ticket });
});

app.post('/api/counter/recall', (req, res) => {
  const officeId = req.body.office || 'DEFAULT';
  const state = getOfficeState(officeId);
  const { windowId, ticketId } = req.body;
  const ticket = state.tickets.find(t => t.id === ticketId);
  if (!ticket) return res.status(404).json({ error: 'Not found' });

  ticket.history.push({ action: 'RECALLED', windowId, at: new Date().toISOString() });
  io.to(officeId).emit('ticket-called', { ticket, windowId, stationType: ticket.steps[ticket.currentStepIndex], isRecall: true });
  res.json({ ticket });
});

app.post('/api/counter/reinstate', (req, res) => {
  const officeId = req.body.office || 'DEFAULT';
  const state = getOfficeState(officeId);
  const { ticketId } = req.body;
  const ticket = state.tickets.find(t => t.id === ticketId);
  if (!ticket) return res.status(404).json({ error: 'Not found' });

  ticket.status = 'WAITING';
  ticket.history.push({ action: 'REINSTATED', at: new Date().toISOString() });
  broadcast(officeId);
  res.json({ ticket });
});

app.post('/api/admin/reset', (req, res) => {
  const officeId = req.body.office || 'DEFAULT';
  resetState();
  broadcast(officeId);
  io.emit('system-reset');
  res.json({ success: true });
});

app.get('/api/admin/report', (req, res) => {
  const officeId = req.query.office || 'DEFAULT';
  const state = getOfficeState(officeId);
  const report = {
    total: state.tickets.length,
    completed: state.tickets.filter(t => t.status === 'COMPLETED').length,
    byCategory: {},
    byStation: {}
  };
  Object.keys(CATEGORIES).forEach(cat => {
    report.byCategory[cat] = state.tickets.filter(t => t.category === cat);
  });
  Object.keys(STATIONS).forEach(st => {
    report.byStation[st] = state.tickets.filter(t => t.steps.includes(st)).length;
  });
  res.json(report);
});

// ─── SOCKET.IO ────────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  const officeId = socket.handshake.query.office || 'DEFAULT';
  socket.join(officeId);
  socket.emit('queue-updated', getQueueState(officeId));

  socket.on('counter-online', ({ windowId, stationType }) => {
    const state = getOfficeState(officeId);
    state.counters[windowId] = {
      stationType,
      currentTicket: state.counters[windowId]?.currentTicket || null,
      isOnline: true,
      socketId: socket.id
    };
    broadcast(officeId);
  });

  socket.on('disconnect', () => {
    const state = getOfficeState(officeId);
    Object.entries(state.counters).forEach(([wId, c]) => {
      if (c.socketId === socket.id) state.counters[wId].isOnline = false;
    });
    broadcast(officeId);
  });
});

// ─── START ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════════════════════╗');
  console.log('  ║  🚦 LTO CALAPAN ENHANCED QUEUE SYSTEM v2.0          ║');
  console.log('  ╠══════════════════════════════════════════════════════╣');
  console.log('  ║  Server: http://0.0.0.0:' + PORT + '                    ║');

  console.log('  ║  Categories: DL, MV, OC, MS, LE with sub-types      ║');
  console.log('  ║  Optimized Socket.io + Multi-stage workflows        ║');
  console.log('  ║                                                     ║');
  console.log('  ║  Kiosk:   http://IP:' + PORT + '/kiosk.html             ║');

  console.log('  ║  Board:   http://IP:' + PORT + '/board.html             ║');

  console.log('  ║  Counter: http://IP:' + PORT + '/counter.html           ║');

  console.log('  ║  Admin:   http://IP:' + PORT + '/admin.html             ║');

  console.log('  ╚══════════════════════════════════════════════════════╝');
  console.log('');
  console.log('TODO.md progress tracked. Check VS Code tabs.');
});
