# API Documentation 📡

Detailed documentation of all available API endpoints for the **App-BDJ-Back** project.

**Base URL**: `http://localhost:3000` (default)
**Authentication**: Most endpoints require a Bearer Token via `Authorization` header.

---
## 🔐 Auth

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/signup` | Public | Register a new user account. |
| `POST` | `/auth/login` | Public | Login to receive Access & Refresh tokens. |
| `POST` | `/auth/refresh` | Public | Refresh an expired Access token using a Refresh token. |
| `POST` | `/auth/logout` | Public | Invalidate a Refresh token (logout). |
| `POST` | `/auth/revoke-all-sessions` | User | Revoke ALL sessions (Refresh Tokens) for the user. |
| `GET` | `/auth/me` | User | Get the currently logged-in user's private profile. |

---
## 👤 Users

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/users/:id` | Public | Get a user's public profile. |
| `PUT` | `/users/:id` | **Owner** | Update profile details (firstname, lastname, bio, etc.). |
| `DELETE` | `/users/:id` | **Owner** | Delete user account. |
| `POST` | `/users/me/avatar` | **Owner** | Upload a new profile avatar. |
| `POST` | `/users/:id/follow` | User | Follow a user. |
| `DELETE` | `/users/:id/follow` | User | Unfollow a user. |
| `GET` | `/users/:id/followers` | Public | List followers of a user. |
| `GET` | `/users/:id/following` | Public | List users followed by a user. |

---
## 📰 Articles

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/articles/` | Public | List all articles (sorted by date). |
| `GET` | `/articles/:id` | Public | Get details of a single article. |
| `POST` | `/articles/` | **Admin/Mod** | Create a new article. |
| `PUT` | `/articles/:id` | **Author** | Update an existing article. |
| `DELETE` | `/articles/:id` | **Author** | Delete an article. |
| `POST` | `/articles/:id/like` | User | Toggle like status on an article. |

---
## ❓ Questions

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/questions/submit` | User | Submit a new question to the admin team. |
| `GET` | `/questions/public` | Public | List all answered questions (FAQ style). |
| `GET` | `/questions/` | **Admin** | List all questions (including unanswered). |
| `POST` | `/questions/` | **Admin** | Create a question directly. |
| `GET` | `/questions/:id` | **Admin** | Get question details. |
| `PUT` | `/questions/:id` | **Admin** | Update/Answer a question. |
| `DELETE` | `/questions/:id` | **Admin** | Delete a question. |

---
## 📅 Events

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/events/` | Public | List all upcoming events. |
| `GET` | `/events/:id` | Public | Get details of a specific event. |
| `POST` | `/events/` | **Admin** | Create a new event and notify users. |
| `POST` | `/events/:id/register` | User | Register for an event / Join. |
| `DELETE` | `/events/:id/register` | User | Unregister from an event / Leave. |

---
## 💬 Forum

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/forum/topics` | Public | List all discussion topics. |
| `POST` | `/forum/topics` | User | Create a new discussion topic. |
| `GET` | `/forum/topics/:id` | Public | Get a specific topic details. |
| `POST` | `/forum/topics/:id/like` | User | Toggle like on a topic. |
| `POST` | `/forum/topics/:id/follow` | User | Toggle following a topic for updates. |
| `GET` | `/forum/topics/:id/posts` | Public | List replies/posts within a topic. |
| `POST` | `/forum/topics/:id/posts` | User | Post a reply to a topic. |

---
## 💡 Suggestions

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/suggestions/submit` | User | Submit a new suggestion. |
| `GET` | `/suggestions/public` | Public | List all suggestions with vote counts. |
| `POST` | `/suggestions/:id/vote` | User | Upvote or Downvote a suggestion. |
| `GET` | `/suggestions/` | **Admin** | List suggestions (Admin view). |
| `POST` | `/suggestions/` | **Admin** | Create suggestion (Admin method). |
| `GET` | `/suggestions/:id` | **Admin** | Get suggestion details. |
| `PUT` | `/suggestions/:id` | **Admin** | Update suggestion. |
| `DELETE` | `/suggestions/:id` | **Admin** | Delete suggestion. |

---
## 📨 Messaging

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/messaging/` | User | List all conversations for the current user. |
| `POST` | `/messaging/` | User | Start a new conversation. |
| `GET` | `/messaging/:id/messages` | Participant | Get message history of a conversation. |
| `POST` | `/messaging/:id/messages` | Participant | Send a message to a conversation. |

---
## 🔔 Notifications

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/notifications/` | User | List recent notifications. |
| `PATCH` | `/notifications/:id/read` | User | Mark a notification as read. |
| `DELETE` | `/notifications/:id` | User | Delete a notification. |
