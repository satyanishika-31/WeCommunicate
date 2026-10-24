# Audit changes

| Item | Status | Files changed |
|---|---|---|
| 1. Notification creation and frontend loading | Done | `backend/utils/createNotification.js`, `backend/controllers/{post,complaint,event}Controller.js`, `frontend/src/context/NotificationContext.jsx`, `frontend/src/api/services.js` |
| 2. Complaint acknowledgement and hourly reminders | Done | `backend/jobs/complaintReminders.js`, `backend/models/Complaint.js`, `backend/server.js`, `backend/package.json` |
| 3. Notice acknowledgement summary and reminders | Done | `backend/controllers/postController.js`, `backend/routes/postRoutes.js`, `frontend/src/components/feed/FeedCard.jsx` |
| 4. Notice/pin/update authorization | Done | `backend/controllers/postController.js`, `frontend/src/components/feed/FeedCard.jsx` |
| 5. Records names, file filter, scope, and head access | Done | `backend/controllers/recordController.js`, `backend/routes/recordRoutes.js`, `backend/middleware/uploadMiddleware.js`, `frontend/src/pages/Records.jsx` |
| 6. Collision-safe complaint ticket IDs | Done | `backend/models/Counter.js`, `backend/controllers/complaintController.js` |
| 7. Complaint scope, status order, assignment, and single-record access | Done | `backend/controllers/complaintController.js` |
| 8. User list/detail scope | Done | `backend/controllers/userController.js` |
| 9. House linking and resident approval | Done | `backend/models/User.js`, `backend/controllers/authController.js`, `backend/controllers/userController.js`, `backend/routes/userRoutes.js`, `frontend/src/pages/Register.jsx` |
| 10. Business/event ownership and duplicate reviews | Done | `backend/controllers/{business,event}Controller.js`, `backend/routes/{business,event}Routes.js` |
| 11. Environment-based admin seed | Done | `backend/config/db.js`, `backend/controllers/authController.js`, `backend/.env.example` |
| 12. Auth rate limits and production errors | Done | `backend/server.js` |
| 13. Validation and update whitelists | Done | `backend/middleware/validationMiddleware.js`, `backend/routes/{auth,post,complaint,record}Routes.js`, relevant controllers |
| 14. Upload persistence documentation | Done | `README.md` |
| 15. Deployment environment documentation | Done | `README.md`, `backend/.env.example` |

## Manual test checklist

### Resident

1. Register with a valid community/block/house and confirm login is rejected as
   pending.
2. Have a manager approve the account, log in, and confirm the linked house,
   notifications, unread count, notices, complaint receipt, events, and
   community-scoped records.
3. Acknowledge a notice and verify the resident sees only their own acknowledgement
   state and the count, not the full acknowledgement user list.

### Block Manager

1. Approve a pending resident in the manager's block.
2. Publish a NOTICE, pin another post in scope, inspect acknowledgement totals,
   list non-acknowledgers, and send a reminder.
3. Create/update complaint status in order, assign a same-community user, and
   confirm another block's complaint is forbidden.
4. Create a record with a PDF/DOC/DOCX/image under 10 MB and verify other
   communities' records are not returned.

### Community Head

1. Approve a resident in the same community, publish a notice/event, and create
   a record.
2. Update or close only in-scope businesses/events and verify duplicate business
   reviews are rejected.

### Admin

1. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD`, start with an empty users collection,
   and confirm exactly one admin is seeded; restart and confirm it is not reset.
2. Verify admin can manage any complaint/post/user/business/event and can view
   acknowledgement summaries.
3. Verify repeated login/register attempts are rate limited and production
   errors do not expose internal messages.

## Verification

- `npm run build:frontend`
- `node --check backend/server.js`
- `npm run start:backend`
