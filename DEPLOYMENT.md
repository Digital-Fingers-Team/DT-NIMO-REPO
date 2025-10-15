# Deploy to Firebase Hosting

Prereqs:
- Install Firebase CLI
- Login: `firebase login`
- Make sure you have access to project `dt-edu-1d5ad` or update `.firebaserc` accordingly

Deploy steps:
1. Set rules
   - `firebase deploy --only firestore:rules`
   - `firebase deploy --only storage:rules`
2. Deploy functions and hosting
   - `npm --prefix functions i`
   - `firebase deploy --only functions`
   - `firebase deploy --only hosting`

Notes
- Hosting serves `public/` with rewrites to `index.html` and `/api/**` to functions
- Update users and roles in Firestore:
  - Create doc `roles/{uid}` with `{ roles: ['teacher'] }` etc.
- Real-time chat collections:
  - `chats/{chatId}`: `{ title, members: [uid...], updatedAt }`
  - `chats/{chatId}/messages/{messageId}`: `{ senderId, text, createdAt }`
- Files:
  - Stored in Storage under `uploads/...`, metadata in Firestore `files` collection with `type` field: `preparation` or `homework`

Local emulation
- `firebase emulators:start` (requires setting up emu config)
