# We Communicate Code Audit

This report reflects the source currently in the repository. Paths are relative to the repository root. “Implemented” describes code found, not production readiness.

## 1. Tech stack actually used

- **Frontend:** React 19, Vite 8, Tailwind CSS 4, React Router DOM 7, Framer Motion, Lucide React and Axios. App state uses React Context and component state; no Redux store is present. Evidence: `frontend/package.json`, `frontend/src/App.jsx`, `frontend/src/context/AuthContext.jsx`, `frontend/src/api/axios.js`.
- **Backend/runtime:** Node.js with Express 5, CommonJS. Evidence: `backend/package.json`, `backend/server.js`.
- **Database/ORM:** MongoDB with Mongoose 9. Evidence: `backend/config/db.js`, `backend/models/*.js`.
- **Auth/token storage:** JWT bearer token signed for 7 days (`backend/controllers/authController.js`), verified by `protect` (`backend/middleware/authMiddleware.js`). Browser stores token and user in `localStorage` (`frontend/src/context/AuthContext.jsx`); Axios sends `Authorization: Bearer ...` (`frontend/src/api/axios.js`). Cookie parser is initialized but auth does not use cookies. Logout endpoint returns success but does not revoke the JWT.
- **Uploads:** Multer local disk storage to `backend/uploads`, served as `/uploads` (`backend/middleware/uploadMiddleware.js`, `backend/server.js`). Image uploads accept image MIME types up to 5 MB; record-specific `upload.records` accepts images/PDF/DOC/DOCX up to 10 MB. No Cloudinary or other cloud storage configuration was found.
- **Deployment:** Vercel SPA rewrites exist in `vercel.json`, `frontend/vercel.json`, and `frontend/public/vercel.json`. Frontend API URL uses `VITE_API_URL`, defaulting to localhost (`frontend/src/api/axios.js`, `frontend/.env.example`). No backend hosting config or confirmed production backend URL is present; hosting is therefore unclear beyond Vercel frontend intent.

## 2. Roles and permissions

The `User` model enum has `ADMIN`, `COMMUNITY_HEAD`, `BLOCK_MANAGER`, and `USER` (resident), plus `isApproved` (`backend/models/User.js`). `protect` checks JWT and blocks USER accounts where `isApproved === false`; `authorize(...roles)` checks the role (`backend/middleware/authMiddleware.js`, `backend/middleware/roleMiddleware.js`). Resource ownership/scope checks also appear in controllers.

- **ADMIN:** Frontend gates `/admin/*` and `/manager/*` to ADMIN as applicable (`frontend/src/App.jsx`). API grants broad administrative actions including communities, blocks, houses, complaint management, business approval, events and user approval. Some routes still rely only on authentication, and some list endpoints are broadly scoped.
- **COMMUNITY_HEAD:** Frontend permits `/admin/*`. API permits community details/head-scoped block manager operations; user/blocks and other management access depends on route and controller checks. Can publish notices, pin/manage posts, approve businesses, manage events and create records in the relevant routes. `getUsers` filters by community. Evidence: `frontend/src/App.jsx`, `backend/routes/*.js`, `backend/controllers/communityController.js`, `backend/controllers/userController.js`.
- **BLOCK_MANAGER:** Frontend permits `/manager/*`. Can view block-scoped users/complaints, approve residents, manage in-scope complaints, approve businesses, and manage events. Some block/house mutation routes allow managers without a resource-level block check. Evidence: `frontend/src/pages/manager/BlockManagerDashboard.jsx`, `backend/controllers/userController.js`, `backend/controllers/complaintController.js`, route files.
- **USER (resident):** Authenticated standard pages; can create general posts, raise complaints, acknowledge notices, RSVP, submit businesses/reviews, and read records. Cannot publish NOTICE in `createPost`; may be blocked from login/API access while pending approval. Evidence: `backend/controllers/postController.js:createPost`, `backend/controllers/authController.js:login`, `backend/middleware/authMiddleware.js`.
- Frontend route guards are in `frontend/src/components/common/ProtectedRoute.jsx`. UI role switching in `AuthContext.switchRole` changes local UI state only and does not alter the backend JWT identity.

## 3. Feature-by-feature status

1. **Notice board / community feed — Implemented (basic).** Posts support NOTICE/GENERAL/EVENT/BUSINESS, urgent and pinned flags, and manager-only notice creation. Feed displays notice acknowledgement state. Pin permissions include managers. Evidence: `frontend/src/pages/Notices.jsx`, `frontend/src/components/feed/FeedCard.jsx`, `backend/controllers/postController.js:createPost`, `togglePinPost`, `backend/models/Post.js`.
2. **Notice acknowledgement — Implemented (basic).** Residents can toggle acknowledgement; feed shows count and “acknowledged by me”. Managers can get total, acknowledged count, and a list of non-acknowledgers through `getAcknowledgements`. Evidence: `backend/controllers/postController.js:acknowledgePost`, `getPosts`, `getAcknowledgements`; `backend/routes/postRoutes.js`; `frontend/src/components/feed/FeedCard.jsx`.
3. **Reminders/escalation for unacknowledged residents — Partly.** Managers can manually call `POST /:id/remind-non-acknowledgers`, which creates in-app notifications. This endpoint has no manager role/ownership check. No scheduled notice acknowledgement reminder was found. Evidence: `backend/controllers/postController.js:remindNonAcknowledgers`, `backend/routes/postRoutes.js`, `backend/utils/createNotification.js`.
4. **Complaint registration — Implemented.** Title, description, category and optional image are stored with resident, block/house, flat and intake route fields. Validation checks title/description; Multer accepts image. Evidence: `frontend/src/components/complaints/RaiseComplaintModal.jsx`, `backend/routes/complaintRoutes.js`, `backend/controllers/complaintController.js:createComplaint`, `backend/models/Complaint.js`.
5. **Complaint ticket ID — Implemented.** A `Counter` model atomically increments sequence from 1000 and creates `CMP-<sequence>`. Evidence: `backend/controllers/complaintController.js:nextTicketId`, `backend/models/Counter.js`.
6. **Complaint status flow — Implemented (basic).** PENDING → IN_PROGRESS → RESOLVED transitions are checked; ADMIN or BLOCK_MANAGER can update, with block check for managers. Evidence: `backend/controllers/complaintController.js:updateComplaintStatus`, `backend/routes/complaintRoutes.js`, `backend/models/Complaint.js`.
7. **Handler assignment and resolution notes — Implemented (basic).** Complaint has `assignedTo`, `assignedHandlerName`, `resolutionNotes`, and `resolvedAt`; assign route checks manager block and assignee community. Evidence: `backend/controllers/complaintController.js:assignComplaint`, `updateComplaintStatus`, `backend/models/Complaint.js`.
8. **Automatic complaint acknowledgement/reminders — Partly.** Creation sends an in-app receipt to reporter and a notice to block manager; status/assignment updates notify reporter. An hourly cron creates notifications for PENDING complaints older than 24h and IN_PROGRESS complaints older than 72h, subject to reminder interval and recipient availability. It notifies block manager/assignee, not the resident. Evidence: `backend/controllers/complaintController.js`, `backend/jobs/complaintReminders.js`, `backend/server.js`, `backend/utils/createNotification.js`.
9. **Notifications — Partly.** In-app records support types NEW_BUSINESS, NEW_NOTICE, COMPLAINT_UPDATE, EVENT, GENERAL; routes list/read/read-all/delete. Notice, event and complaint code creates records. No push, email, SMS or WhatsApp service is connected. Evidence: `backend/models/Notification.js`, `backend/controllers/notificationController.js`, `backend/utils/createNotification.js`, feature controllers.
10. **Records/document vault — Partly.** Records have categories, URL, uploader, reference and community; authenticated users list their community records; ADMIN/COMMUNITY_HEAD/BLOCK_MANAGER create, ADMIN route can delete (controller also permits uploader). UI/API naming is inconsistent: UI uses `fileUrl`/`documentRef`; API expects `documentUrl`/`referenceCode`; UI uses `HANDOVER_LOG` while model enum has `COMMITTEE_HANDOVER`. Record file upload accepts PDF/DOC/DOCX/images, but the UI form asks for a URL. Evidence: `frontend/src/pages/Records.jsx`, `backend/routes/recordRoutes.js`, `backend/controllers/recordController.js`, `backend/models/Record.js`, `backend/middleware/uploadMiddleware.js`.
11. **Resident, block and house management — Partly.** Models represent OWNER/TENANT, house owner/residents, and occupancy state; registration can resolve block and house and link a resident. `isApproved` supports committee approval. Some controller update routes do not consistently enforce block scope; house state lifecycle/vacancy behavior is not comprehensively automated. Evidence: `backend/models/{User,Block,House}.js`, `backend/controllers/authController.js:register`, `backend/controllers/houseController.js`, `backend/controllers/userController.js`.
12. **Events — Implemented (basic).** ADMIN, COMMUNITY_HEAD and BLOCK_MANAGER can create/update/delete; authenticated residents RSVP, and attendee lists are populated. Event create sends in-app notification; frontend polls. Ownership/community checks exist for update/delete. Evidence: `backend/routes/eventRoutes.js`, `backend/controllers/eventController.js`, `backend/models/Event.js`, `frontend/src/pages/Events.jsx`, `frontend/src/hooks/useEventPolling.js`.
13. **Business/service directory — Partly.** New businesses default PENDING; ADMIN/COMMUNITY_HEAD/BLOCK_MANAGER can approve; owner/managers can pause/resume/close; duplicate reviews are blocked, but reviews are not checked against community membership and directory results are not status-filtered in controller. Evidence: `backend/routes/businessRoutes.js`, `backend/controllers/businessController.js`, `backend/models/Business.js`, `frontend/src/pages/Businesses.jsx`.
14. **User registration / residence verification — Partly.** Registration requires valid fields and a password length of at least six, can resolve an existing block/house and sets `isApproved:false`; login and `protect` block pending USER accounts. A manager can approve. This is approval gating, not proof of residence: no email/phone verification or document verification was found. Evidence: `backend/controllers/authController.js:register`, `login`, `backend/controllers/userController.js:approveUser`, `backend/models/User.js`, `backend/routes/userRoutes.js`.

## 4. Database models

All listed models use Mongoose timestamps except `Counter`.

- **User — `backend/models/User.js`:** `name:String` required; `email:String` required/unique/lowercase; `password:String` required; `phone:String`; `community:String`; `houseNumber:String`; `role:String` enum ADMIN/COMMUNITY_HEAD/BLOCK_MANAGER/USER default USER; `residentType:String` enum OWNER/TENANT; `house:ObjectId ref House`; `block:ObjectId ref Block`; `profileImage:String`; `isApproved:Boolean` default true.
- **Community — `backend/models/Community.js`:** `name:String` required; `location:String`; `code:String` required/unique; `totalBlocks:Number`; `totalFlats:Number`; `managerName:String`; `residentCount:Number`; `communityHead:ObjectId ref User`; `blocksList:[String]`; `flatsList:[String]`.
- **Block — `backend/models/Block.js`:** `name:String` required; `blockNumber:String` required; `community:String`; `manager:ObjectId ref User`; `totalHouses:Number`; `description:String`.
- **House — `backend/models/House.js`:** `houseNumber:String` required; `block:ObjectId ref Block` required; `owner:ObjectId ref User`; `residents:[ObjectId ref User]`; `status:String` enum OWNER_OCCUPIED/TENANT_OCCUPIED/VACANT.
- **Post — `backend/models/Post.js`:** `author:ObjectId ref User` required; `type:String` enum GENERAL/NOTICE/EVENT/BUSINESS; `title:String` required; `description:String` required; `image:String`; `likes:[ObjectId ref User]`; `comments:[{user:ObjectId ref User,text:String required,createdAt:Date}]`; `block:ObjectId ref Block`; `isPinned:Boolean`; `isUrgent:Boolean`; `acknowledgements:[{user:ObjectId ref User,acknowledgedAt:Date}]`.
- **Complaint — `backend/models/Complaint.js`:** `ticketId:String` unique; `raisedBy:ObjectId ref User` required; `block:ObjectId ref Block`; `house:ObjectId ref House`; `flatNumber:String`; `intakeRoute:String` enum RESIDENT_APP/SECURITY_GUARD/OFFICE_REGISTER/PHONE_ESCALATION/OTHER; `title:String` required; `description:String` required; `category:String` enum WATER/ELECTRICITY/LIFT/CLEANING/SECURITY/PARKING/MAINTENANCE/OTHER; `image:String`; `status:String` enum PENDING/IN_PROGRESS/RESOLVED; `assignedHandlerName:String`; `assignedTo:ObjectId ref User`; `resolutionNotes:String`; `resolvedAt:Date`; `lastReminderAt:Date`.
- **Counter — `backend/models/Counter.js`:** `_id:String` required; `sequence:Number` default 1000. Used for complaint ticket IDs.
- **Business — `backend/models/Business.js`:** `owner:ObjectId ref User` required; `businessName:String` required; `category:String` enum TAILORING/TUITION/BAKING/BEAUTY/FITNESS/ART/FOOD/OTHER required; `description:String` required; `images:[String]`; `services:[{name:String required,price:Number}]`; `contact:String`; `timings:String`; `status:String` enum PENDING/ACTIVE/PAUSED/CLOSED; `approvedBy:ObjectId ref User`; `reviews:[{author:ObjectId ref User required,rating:Number min 1 max 5 required,comment:String}]`.
- **Event — `backend/models/Event.js`:** `createdBy:ObjectId ref User` required; `title:String` required; `description:String`; `poster:String`; `date:Date` required; `time:String`; `venue:String` required; `community:String`; `block:ObjectId ref Block`; `attendees:[ObjectId ref User]`.
- **Record — `backend/models/Record.js`:** `title:String` required; `category:String` enum BYLAWS/AGM_MINUTES/COMMITTEE_HANDOVER/FINANCIAL_AUDIT/VENDOR_CONTRACT/SOCIETY_RESOLUTION; `description:String`; `documentUrl:String`; `referenceCode:String`; `effectiveDate:Date`; `uploadedBy:ObjectId ref User` required; `community:String`.
- **Notification — `backend/models/Notification.js`:** `recipient:ObjectId ref User` required; `type:String` enum NEW_BUSINESS/NEW_NOTICE/COMPLAINT_UPDATE/EVENT/GENERAL required; `title:String` required; `message:String` required; `relatedId:ObjectId`; `isRead:Boolean` default false.

## 5. API endpoints

Prefixes are mounted in `backend/server.js`. `Authenticated` means `protect` bearer-token middleware. “Controller check” means the route itself does not include a role list, but a handler may apply owner/scope logic.

| Method | Path | Role required | What it does |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register USER, link matching house/block when provided, mark pending approval, issue JWT |
| POST | `/api/auth/login` | Public | Verify credentials; deny unapproved USER; issue JWT |
| POST | `/api/auth/logout` | Public | Return success; no token revocation |
| GET | `/api/auth/me` | Authenticated | Fetch current user and populated house/block |
| GET | `/api/users` | ADMIN, COMMUNITY_HEAD, BLOCK_MANAGER | List users; head community scoped, manager block scoped |
| PUT | `/api/users/:id/approve` | ADMIN, COMMUNITY_HEAD, BLOCK_MANAGER | Approve resident; controller checks scope |
| GET | `/api/users/:id` | Authenticated + controller check | Fetch user if self/admin/same community or block manager in same block |
| PUT | `/api/users/:id` | Authenticated + self/ADMIN | Update profile fields |
| DELETE | `/api/users/:id` | ADMIN | Delete user |
| GET | `/api/blocks` | ADMIN, COMMUNITY_HEAD, BLOCK_MANAGER, USER | List blocks; community head filtered |
| GET | `/api/blocks/:id` | ADMIN, BLOCK_MANAGER, USER | Fetch block |
| POST | `/api/blocks` | ADMIN | Create block |
| PUT | `/api/blocks/:id` | ADMIN | Update block |
| DELETE | `/api/blocks/:id` | ADMIN | Delete block |
| PUT | `/api/blocks/:id/manager` | ADMIN | Assign manager reference |
| GET | `/api/houses` | ADMIN, BLOCK_MANAGER | List houses (controller scope applies where implemented) |
| GET | `/api/houses/:id` | Authenticated | Fetch house |
| POST | `/api/houses` | ADMIN | Create house |
| PUT | `/api/houses/:id` | ADMIN, BLOCK_MANAGER | Update house |
| DELETE | `/api/houses/:id` | ADMIN | Delete house |
| PUT | `/api/houses/:id/resident` | ADMIN, BLOCK_MANAGER | Add resident to house |
| GET | `/api/communities` | Public | List communities; filters for authenticated community head |
| POST | `/api/communities` | ADMIN | Create community and blocks |
| DELETE | `/api/communities/:id` | ADMIN | Delete community |
| GET | `/api/communities/:id/details` | ADMIN, COMMUNITY_HEAD | Fetch community roster/details; head ownership checked |
| POST | `/api/communities/:id/assign-head` | ADMIN | Assign/create community head |
| POST | `/api/communities/:id/assign-block-manager` | ADMIN, COMMUNITY_HEAD | Assign existing owner as block manager |
| POST | `/api/communities/:id/create-block-manager` | ADMIN, COMMUNITY_HEAD | Create manager credentials |
| GET | `/api/posts` | Authenticated | Feed, counts and current-user acknowledgement flag |
| GET | `/api/posts/:id` | Authenticated + controller check | Fetch post; code applies author/manager check |
| GET | `/api/posts/:id/acknowledgements` | Manager role (controller check) | Return total, acknowledged count and pending resident list |
| POST | `/api/posts/:id/remind-non-acknowledgers` | Authenticated; no manager check | Create in-app reminder notifications for non-acknowledgers |
| POST | `/api/posts` | Authenticated; NOTICE requires manager role | Create post and notifications for notice/event |
| DELETE | `/api/posts/mine` | Authenticated | Delete caller's posts |
| PUT | `/api/posts/:id` | Authenticated | Update post; handler lacks effective ownership check in current source |
| DELETE | `/api/posts/:id` | Authenticated + controller check | Delete by author or manager |
| PATCH | `/api/posts/:id/pin` | Authenticated + controller check | Toggle pin, author or manager |
| POST | `/api/posts/:id/acknowledge` | Authenticated | Toggle acknowledgement |
| POST | `/api/posts/:id/like` | Authenticated | Toggle like |
| POST | `/api/posts/:id/comment` | Authenticated | Add comment |
| DELETE | `/api/posts/:id/comment/:commentId` | Authenticated + controller check | Delete comment; current controller references `isAdmin` without defining it |
| GET | `/api/complaints` | ADMIN, BLOCK_MANAGER, USER | List all/admin, manager block, resident own complaints |
| POST | `/api/complaints` | Authenticated | Create ticket and receipt/manager notifications |
| GET | `/api/complaints/:id` | Authenticated + controller check | Fetch own/admin/same-block manager complaint |
| PUT | `/api/complaints/:id` | ADMIN, BLOCK_MANAGER | Update allowed fields; manager block scoped |
| PUT | `/api/complaints/:id/status` | ADMIN, BLOCK_MANAGER | Enforce next status, set notes/handler/resolved time and notify reporter |
| PUT | `/api/complaints/:id/assign` | ADMIN, BLOCK_MANAGER | Assign community user; manager block scoped and reporter notified |
| DELETE | `/api/complaints/:id` | ADMIN | Delete complaint |
| GET | `/api/events` | Authenticated | List community/unscoped events |
| GET | `/api/events/:id` | Authenticated | Fetch event |
| POST | `/api/events` | ADMIN, COMMUNITY_HEAD, BLOCK_MANAGER | Create event and notify community |
| PUT | `/api/events/:id` | ADMIN, COMMUNITY_HEAD, BLOCK_MANAGER | Update with creator/community check |
| DELETE | `/api/events/:id` | ADMIN, COMMUNITY_HEAD, BLOCK_MANAGER | Delete with creator/community check |
| POST | `/api/events/:id/rsvp` | Authenticated | Toggle RSVP |
| GET | `/api/businesses` | Authenticated | List businesses |
| GET | `/api/businesses/:id` | Authenticated | Fetch business |
| POST | `/api/businesses` | Authenticated | Create pending business, up to 5 images |
| PUT | `/api/businesses/:id` | Authenticated + controller check | Update business if owner or management role |
| PUT | `/api/businesses/:id/approve` | ADMIN, COMMUNITY_HEAD, BLOCK_MANAGER | Approve business |
| PUT | `/api/businesses/:id/pause` | Authenticated + controller check | Pause business |
| PUT | `/api/businesses/:id/resume` | Authenticated + controller check | Resume business |
| PUT | `/api/businesses/:id/close` | Authenticated + controller check | Close business |
| POST | `/api/businesses/:id/reviews` | Authenticated | Add one 1–5 star review per user |
| DELETE | `/api/businesses/:id` | Authenticated + owner check | Delete own listing |
| GET | `/api/notifications` | Authenticated | List caller notifications |
| PUT | `/api/notifications/:id/read` | Authenticated | Mark own notification read |
| PUT | `/api/notifications/read-all` | Authenticated | Mark caller's notifications read |
| DELETE | `/api/notifications/:id` | Authenticated | Delete own notification |
| GET | `/api/records` | Authenticated | List records filtered to caller community, optional category |
| POST | `/api/records` | ADMIN, COMMUNITY_HEAD, BLOCK_MANAGER | Create record; accepts PDF/DOC/DOCX/image upload |
| DELETE | `/api/records/:id` | ADMIN route; uploader/ADMIN controller | Delete record |
| GET | `/` | Public | API welcome response |
| GET | `/api/health` | Public | Health response |

## 6. Data flow for these three scenarios

### a) A manager publishes a notice and a resident acknowledges it

1. Manager composes a notice in `frontend/src/pages/CreatePost.jsx`; `postService.create` in `frontend/src/api/services.js` sends POST `/api/posts` with JWT from `frontend/src/api/axios.js`.
2. `backend/routes/postRoutes.js` checks token, parses optional image and validates title/description. `backend/controllers/postController.js:createPost` permits NOTICE only for ADMIN/COMMUNITY_HEAD/BLOCK_MANAGER, saves `Post`, finds residents by block or manager community and calls `backend/utils/createNotification.js` for in-app notice notifications.
3. Resident sees notice in `frontend/src/pages/Notices.jsx`; `getPosts` returns count and `acknowledgedByMe` without exposing the full acknowledgement list.
4. Resident clicks acknowledgement in `frontend/src/components/feed/FeedCard.jsx`; `acknowledgePost` toggles resident ID/time and returns count. Managers can inspect `/api/posts/:id/acknowledgements` using `getAcknowledgements`; manual reminder endpoint calls `remindNonAcknowledgers` and creates in-app notification records. The reminder endpoint currently lacks a role/scope check.

### b) A resident raises a complaint and a manager resolves it

1. `frontend/src/pages/Complaints.jsx` opens `frontend/src/components/complaints/RaiseComplaintModal.jsx`; form sends title, description, category and optional image via `complaintService.create`.
2. `backend/routes/complaintRoutes.js` applies JWT, upload and validation. `backend/controllers/complaintController.js:createComplaint` calls `nextTicketId`, which increments `Counter` (`backend/models/Counter.js`), creates `Complaint`, and sends in-app receipt and block-manager notices through `createNotification`.
3. Manager dashboard loads complaints; `getComplaints` filters manager to their block (`frontend/src/pages/manager/BlockManagerDashboard.jsx`, `backend/controllers/complaintController.js`).
4. Manager uses `ComplaintDetailModal.jsx`; status route calls `updateComplaintStatus`, checks the next allowed transition and manager block, updates handler/notes/resolved time and notifies resident. Hourly job `backend/jobs/complaintReminders.js`, started from `backend/server.js`, adds in-app reminders for stale PENDING/IN_PROGRESS tickets when a manager/assignee recipient exists.

### c) A new committee views past records

1. An authenticated committee member opens `/records` (`frontend/src/App.jsx`, `frontend/src/pages/Records.jsx`); `recordService.getAll` calls GET `/api/records`.
2. `backend/routes/recordRoutes.js` applies `protect`; `backend/controllers/recordController.js:getRecords` filters by `req.user.community`, optional category, and populates uploader.
3. UI renders record metadata and links to `fileUrl`; backend schema/API uses `documentUrl`. The form also sends `documentRef` where API expects `referenceCode`, and UI category `HANDOVER_LOG` differs from schema enum `COMMITTEE_HANDOVER`. Therefore record view/upload fields may not line up in the UI without adaptation.

## 7. Block diagram data

- **Inputs:** ADMIN, COMMUNITY_HEAD, BLOCK_MANAGER, USER; account registration/approval, posts and notice acknowledgement, complaints, business listings/reviews, events/RSVP, resident/block/house administration, record management.
- **Processing blocks:** React/Vite pages and components (`frontend/src/pages`, `frontend/src/components`); service wrappers (`frontend/src/api/services.js`); Axios bearer token (`frontend/src/api/axios.js`); Express routes (`backend/routes`); `protect`, `authorize`, upload and validation middleware (`backend/middleware`); controllers (`backend/controllers`); scheduled job (`backend/jobs/complaintReminders.js`).
- **Storage:** MongoDB models/collections User, Community, Block, House, Post, Complaint, Counter, Business, Event, Record, Notification (`backend/models`). Files use local disk under `backend/uploads`; `/uploads` is served by Express (`backend/middleware/uploadMiddleware.js`, `backend/server.js`).
- **Outputs:** Role-filtered pages, post/acknowledgement counts and pending resident list, complaint ticket/status/notes, event attendee arrays, business status/reviews, record links, and in-app notification rows. No outbound email/SMS/push/WhatsApp output service found.
- **Third-party connections:** MongoDB via `MONGO_URI`; Vercel config indicates frontend deployment intent. No Cloudinary, mail/SMS gateway or push provider. Event updates use frontend HTTP polling (`frontend/src/hooks/useEventPolling.js`), not WebSocket.

## 8. Gaps and risks

- **Docs vs code:** `DOCUMENTATION.md` and `SYSTEM_PROPOSAL_AND_ARCHITECTURE_REPORT.md` describe behavior beyond the implementation. Current code has notice reminders and complaint reminders, but complaint reminders notify management/assignee rather than resident; no scheduled notice-reminder job is present.
- **Authorization flaws:** `POST /api/posts/:id/remind-non-acknowledgers` has no role/scope check. `GET /api/posts/:id/acknowledgements` checks manager role but not that manager's block/community matches the notice. `getPostById` applies an access check that can prevent ordinary residents from fetching a post. Post update lacks a functioning ownership check in the current implementation. `deleteComment` references undefined `isAdmin`, causing an error when reached. Evidence: `backend/controllers/postController.js`, `backend/routes/postRoutes.js`.
- **Cross-resource scope gaps:** House detail/update/add-resident and block detail/update paths should be reviewed for manager scope; records creation stores caller community regardless of submitted community; direct event detail/RSVP do not check event community. Evidence: corresponding `backend/controllers/houseController.js`, `blockController.js`, `recordController.js`, `eventController.js`.
- **Registration is approval-gated, not identity-verified:** No proof-of-residence process. User model defaults `isApproved:true`, while registration explicitly sets false; any other creation path that omits it becomes approved. No email/phone verification. Evidence: `backend/models/User.js`, `backend/controllers/authController.js`, `backend/controllers/userController.js`.
- **LocalStorage JWT:** A script running in the browser can access localStorage token; backend logout does not revoke it. Evidence: `frontend/src/context/AuthContext.jsx`, `frontend/src/api/axios.js`, `backend/controllers/authController.js`.
- **Security/config:** Auth has rate limiting and selected request validation, but no general request schema validation. Upload uses MIME values, not content inspection. Hard-coded default admin credentials remain in seed/database setup (`backend/config/db.js`, `backend/seed.js`).
- **Demo-breaking mismatches:** Records UI expects `fileUrl`, `documentRef`, `HANDOVER_LOG`, while backend uses `documentUrl`, `referenceCode`, `COMMITTEE_HANDOVER`; the create form can send incompatible fields/categories. Manager dashboard's add-user flow and user approval flow should be checked against current backend request fields (`frontend/src/pages/Records.jsx`, `backend/controllers/recordController.js`, `backend/models/Record.js`, `frontend/src/pages/manager/BlockManagerDashboard.jsx`, `backend/controllers/authController.js`).
- **Data/deployment:** Local disk uploads may not persist across deployments. Vercel rewrite config is frontend-only; no backend provider is identified. Runtime depends on `JWT_SECRET`, MongoDB and correctly configured `VITE_API_URL` (`backend/server.js`, `backend/config/db.js`, `frontend/src/api/axios.js`).

## 9. Quick summary table

| Feature | Status (Implemented / Partly / Not implemented) | Evidence (file path) |
|---|---|---|
| React/Vite, Express, MongoDB/Mongoose stack | Implemented | `frontend/package.json`, `backend/package.json`, `backend/config/db.js` |
| Role-based route checks and scoping | Partly | `backend/middleware/roleMiddleware.js`, `backend/routes`, controller files |
| Notices, urgent flag, pin | Implemented (basic) | `backend/controllers/postController.js`, `backend/models/Post.js` |
| Notice acknowledgement list/count | Implemented (basic) | `backend/controllers/postController.js:getAcknowledgements`, `frontend/src/components/feed/FeedCard.jsx` |
| Manual acknowledgement reminders | Partly | `backend/controllers/postController.js:remindNonAcknowledgers` |
| Scheduled notice acknowledgement reminders | Not implemented | `backend/jobs`, `backend/server.js` |
| Complaint registration/photo | Implemented | `backend/controllers/complaintController.js`, `backend/middleware/uploadMiddleware.js` |
| Sequential complaint ticket IDs | Implemented | `backend/models/Counter.js`, `backend/controllers/complaintController.js` |
| Complaint status, assignment and notes | Implemented (basic) | `backend/controllers/complaintController.js`, `backend/routes/complaintRoutes.js` |
| Complaint notifications/reminders | Implemented (in-app) | `backend/jobs/complaintReminders.js`, `backend/utils/createNotification.js` |
| Notification email/push/SMS/WhatsApp | Not implemented | `backend/package.json`, backend source |
| Records vault | Partly | `backend/controllers/recordController.js`, `frontend/src/pages/Records.jsx` |
| House/block occupancy management | Partly | `backend/models/House.js`, `backend/controllers/houseController.js` |
| Events and RSVP | Implemented (basic) | `backend/controllers/eventController.js`, `frontend/src/pages/Events.jsx` |
| Business approval/reviews/status | Partly | `backend/controllers/businessController.js`, `backend/routes/businessRoutes.js` |
| Resident approval | Implemented (basic) | `backend/controllers/authController.js`, `backend/controllers/userController.js:approveUser` |
| Proof of residence verification | Not implemented | `backend/controllers/authController.js`, `frontend/src/pages/Register.jsx` |
| Local uploads / cloud storage | Local Multer implemented; cloud not implemented | `backend/middleware/uploadMiddleware.js`, `backend/server.js` |
| Deployment configuration | Partly | `vercel.json`, `frontend/vercel.json`, `backend/server.js` |
