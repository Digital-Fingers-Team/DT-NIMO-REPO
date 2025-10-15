// Real-time chat using Firestore; login required (no anonymous)
import {
  auth,
  db,
  onAuthStateChanged,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  signOut
} from '../firebase.js';

let currentRoomId = 'global';
let unsubscribe = null;
let authedUser = null;

const CONVERSATIONS = {
  1: { roomId: 'teacher_ahmed', name: 'أ. أحمد محمد', status: 'مدرس الرياضيات - متصل الآن' },
  2: { roomId: 'teacher_fatima', name: 'أ. فاطمة علي', status: 'مدرسة العلوم' },
  3: { roomId: 'principal', name: 'مدير المدرسة', status: 'متصل الآن' },
  4: { roomId: 'friend_classmate', name: 'زميل الدراسة', status: 'غير متصل' }
};

function messagesCol(roomId) {
  return collection(db, 'rooms', roomId, 'messages');
}

function subscribeToRoom(roomId) {
  const listEl = document.getElementById('chat-messages');
  if (!listEl) return;
  // cleanup previous
  if (unsubscribe) unsubscribe();

  const q = query(messagesCol(roomId), orderBy('ts', 'asc'));
  unsubscribe = onSnapshot(q, (snap) => {
    listEl.innerHTML = '';
    snap.forEach((docSnap) => {
      const msg = docSnap.data();
      const wrapper = document.createElement('div');
      wrapper.className = 'message ' + (msg.uid === authedUser?.uid ? 'sent' : 'received');
      const time = msg.ts?.toDate ? new Date(msg.ts.toDate()) : new Date();
      const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      wrapper.innerHTML = `
        <div>${(msg.text || '').replace(/</g,'&lt;')}</div>
        <div class="message-time">${timeStr}</div>
      `;
      listEl.appendChild(wrapper);
    });
    listEl.scrollTop = listEl.scrollHeight;
  });
}

async function sendMessageImpl() {
  const inputEl = document.getElementById('message-input');
  const text = (inputEl?.value || '').trim();
  if (!text || !authedUser) return;
  inputEl.value = '';
  await addDoc(messagesCol(currentRoomId), {
    uid: authedUser.uid,
    text,
    ts: serverTimestamp()
  });
}

// expose handlers for inline HTML onclicks
window.sendMessage = sendMessageImpl;
window.selectConversation = function selectConversation(id) {
  const conv = CONVERSATIONS[id] || CONVERSATIONS[1];
  currentRoomId = conv.roomId;
  const nameEl = document.getElementById('current-chat-name');
  const statusEl = document.getElementById('current-chat-status');
  if (nameEl) nameEl.textContent = conv.name;
  if (statusEl) statusEl.textContent = conv.status;
  subscribeToRoom(currentRoomId);
};
window.newMessage = function newMessage() {
  // placeholder; could open a modal to choose recipient/group
  alert('سيتم دعم إنشاء محادثات مخصصة قريباً');
};

function wireLogout() {
  const el = document.getElementById('logout-link');
  if (el) {
    el.addEventListener('click', async (e) => {
      e.preventDefault();
      try { await signOut(auth); } catch (_) {}
      window.location.href = 'index.html';
    });
  }
}

function guardAuth() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        window.location.href = 'index.html';
        return;
      }
      authedUser = user;
      resolve(user);
    });
  });
}

// bootstrap
document.addEventListener('DOMContentLoaded', async () => {
  await guardAuth();
  wireLogout();
  // default conversation
  window.selectConversation(1);
  const inputEl = document.getElementById('message-input');
  inputEl?.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessageImpl(); });
});
