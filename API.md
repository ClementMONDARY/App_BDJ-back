# API Documentation 📡

Detailed documentation of all available API endpoints and their corresponding schemas for the **App-BDJ-Back** project.

**Base URL**: `http://localhost:3000` (default)
**Authentication**: Most endpoints require a Bearer Token via `Authorization` header.

---
## 🔐 Auth

| Method | Endpoint | Access | Description | Input DTO | Output DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/signup` | Public | Register a new user account. | [signupSchema](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/auth/schema/auth.schema.ts#L3) | [userResponseSchema](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/auth/schema/auth.schema.ts#L16) |
| `POST` | `/auth/login` | Public | Login to receive Access & Refresh tokens. | [loginSchema](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/auth/schema/auth.schema.ts#L11) | [tokenResponseSchema](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/auth/schema/auth.schema.ts#L33) |
| `POST` | `/auth/refresh` | Public | Refresh an expired Access token using a Refresh token. | [refreshSchema](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/auth/schema/auth.schema.ts#L38) | [tokenResponseSchema](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/auth/schema/auth.schema.ts#L33) |
| `POST` | `/auth/logout` | Public | Invalidate a Refresh token (logout). | [logoutSchema](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/auth/schema/auth.schema.ts#L42) | [messageResponseSchema](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/auth/schema/auth.schema.ts#L29) |
| `POST` | `/auth/revoke-all-sessions` | User | Revoke ALL sessions (Refresh Tokens) for the user. | - | [messageResponseSchema](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/auth/schema/auth.schema.ts#L29) |
| `GET` | `/auth/me` | User | Get the currently logged-in user's private profile. | - | [userResponseSchema](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/auth/schema/auth.schema.ts#L16) |

---
## 👤 Users

| Method | Endpoint | Access | Description | Input DTO | Output DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/users/:id` | Public | Get a user's public profile. | - | [ZPublicProfile](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/users/schema/users.schema.ts#L12) |
| `PUT` | `/users/:id` | **Owner** | Update profile details (firstname, lastname, bio, etc.). | [ZUpdateUser](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/users/schema/users.schema.ts#L27) | [ZUserResponse](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/users/schema/users.schema.ts#L3) |
| `DELETE` | `/users/:id` | **Owner** | Delete user account. | - | [messageResponseSchema](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/auth/schema/auth.schema.ts#L29) |
| `POST` | `/users/me/avatar` | **Owner** | Upload a new profile avatar. | Multipart File | [ZUserResponse](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/users/schema/users.schema.ts#L3) |
| `POST` | `/users/:id/follow` | User | Follow a user. | - | [messageResponseSchema](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/auth/schema/auth.schema.ts#L29) |
| `DELETE` | `/users/:id/follow` | User | Unfollow a user. | - | [messageResponseSchema](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/auth/schema/auth.schema.ts#L29) |
| `GET` | `/users/:id/followers` | Public | List followers of a user. | - | [ZUserList](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/users/schema/users.schema.ts#L42) |
| `GET` | `/users/:id/following` | Public | List users followed by a user. | - | [ZUserList](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/users/schema/users.schema.ts#L42) |

---
## 📰 Articles

| Method | Endpoint | Access | Description | Input DTO | Output DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/articles/` | Public | List all articles (sorted by date). | - | [ZArticleList](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/articles/schema/articles.schema.ts#L27) |
| `GET` | `/articles/:id` | Public | Get details of a single article. | - | [ZArticle](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/articles/schema/articles.schema.ts#L3) |
| `POST` | `/articles/` | **Admin/Mod** | Create a new article. | [ZNewArticle](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/articles/schema/articles.schema.ts#L15) | [ZArticle](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/articles/schema/articles.schema.ts#L3) |
| `PUT` | `/articles/:id` | **Author** | Update an existing article. | [ZUpdateArticle](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/articles/schema/articles.schema.ts#L21) | [ZArticle](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/articles/schema/articles.schema.ts#L3) |
| `DELETE` | `/articles/:id` | **Admin/Mod** | Delete an article. | - | [messageResponseSchema](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/auth/schema/auth.schema.ts#L29) |
| `POST` | `/articles/:id/like` | User | Toggle like status on an article. | - | [messageResponseSchema](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/auth/schema/auth.schema.ts#L29) |

---
## ❓ Questions

| Method | Endpoint | Access | Description | Input DTO | Output DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/questions/submit` | User | Submit a new question to the admin team. | [ZUserNewQuestion](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/questions/schema/questions.schema.ts#L28) | [ZQuestion](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/questions/schema/questions.schema.ts#L5) |
| `GET` | `/questions/public` | Public | List all answered questions (FAQ style). | - | [ZPublicQuestionList](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/questions/schema/questions.schema.ts#L34) |
| `GET` | `/questions/` | **Admin** | List all questions (including unanswered). | - | [ZListQuestions](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/questions/schema/questions.schema.ts#L24) |
| `POST` | `/questions/` | **Admin** | Create a question directly. | [ZNewQuestion](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/questions/schema/questions.schema.ts#L16) | [ZQuestion](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/questions/schema/questions.schema.ts#L5) |
| `GET` | `/questions/:id` | **Admin** | Get question details. | - | [ZQuestion](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/questions/schema/questions.schema.ts#L5) |
| `PUT` | `/questions/:id` | **Admin** | Update/Answer a question. | [ZPartialQuestion](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/questions/schema/questions.schema.ts#L20) | [ZQuestion](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/questions/schema/questions.schema.ts#L5) |
| `DELETE` | `/questions/:id` | **Admin** | Delete a question. | - | [messageResponseSchema](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/auth/schema/auth.schema.ts#L29) |

---
## 📅 Events

| Method | Endpoint | Access | Description | Input DTO | Output DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/events/` | Public | List all upcoming events. | - | [ZEventList](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/events/schema/events.schema.ts#L41) |
| `GET` | `/events/:id` | Public | Get details of a specific event. | - | [ZEvent](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/events/schema/events.schema.ts#L3) |
| `POST` | `/events/` | **Admin** | Create a new event and notify users. | [ZNewEvent](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/events/schema/events.schema.ts#L30) | [ZEvent](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/events/schema/events.schema.ts#L3) |
| `PUT` | `/events/:id` | **Admin** | Update an existing event. | [ZNewEvent](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/events/schema/events.schema.ts#L31) | [ZEvent](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/events/schema/events.schema.ts#L3) |
| `DELETE` | `/events/:id` | **Admin/Mod** | Delete an event. | - | [messageResponseSchema](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/auth/schema/auth.schema.ts#L29) |
| `POST` | `/events/:id/register` | User | Register for an event / Join. | - | [ZRegistration](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/events/schema/events.schema.ts#L22) |
| `DELETE` | `/events/:id/register` | User | Unregister from an event / Leave. | - | [messageResponseSchema](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/auth/schema/auth.schema.ts#L29) |

---
## 💬 Forum

| Method | Endpoint | Access | Description | Input DTO | Output DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/forum/topics` | Public | List all discussion topics. | - | [ZTopicList](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/forum/schema/forum.schema.ts#L41) |
| `POST` | `/forum/topics` | User | Create a new discussion topic. | [ZNewTopic](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/forum/schema/forum.schema.ts#L28) | [ZTopic](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/forum/schema/forum.schema.ts#L3) |
| `GET` | `/forum/topics/:id` | Public | Get a specific topic details. | - | [ZTopic](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/forum/schema/forum.schema.ts#L3) |
| `POST` | `/forum/topics/:id/follow` | User | Toggle following a topic for updates. | - | [ZToggleFollowResponse](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/forum/schema/forum.schema.ts#L47) |
| `GET` | `/forum/topics/:id/posts` | Public | List replies/posts within a topic. | - | [ZPostList](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/forum/schema/forum.schema.ts#L42) |
| `POST` | `/forum/topics/:id/posts` | User | Post a reply to a topic. | [ZNewPost](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/forum/schema/forum.schema.ts#L35) | [ZPost](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/forum/schema/forum.schema.ts#L17) |
| `GET` | `/forum/topics/:id/messagers` | Public | List users who replied to a topic. | - | [ZTopicMessagersResponse](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/forum/schema/forum.schema.ts#L53) |

---
## 💡 Suggestions

| Method | Endpoint | Access | Description | Input DTO | Output DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/suggestions/submit` | User | Submit a new suggestion. | [ZUserNewQuestion](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/suggestions/schema/suggestions.schema.ts#L29) | [ZSuggestion](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/suggestions/schema/suggestions.schema.ts#L5) |
| `GET` | `/suggestions/public` | Public | List all suggestions with vote counts. | - | [ZSuggestionList](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/suggestions/schema/suggestions.schema.ts#L36) |
| `POST` | `/suggestions/:id/vote` | User | Upvote or Downvote a suggestion. | - | [ZVoteSuggestionResponse](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/suggestions/schema/suggestions.schema.ts#L37) |
| `GET` | `/suggestions/` | **Admin** | List suggestions (Admin view). | - | [ZListSuggestions](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/suggestions/schema/suggestions.schema.ts#L25) |
| `POST` | `/suggestions/` | **Admin** | Create suggestion (Admin method). | [ZNewSuggestion](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/suggestions/schema/suggestions.schema.ts#L17) | [ZSuggestion](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/suggestions/schema/suggestions.schema.ts#L5) |
| `GET` | `/suggestions/:id` | **Admin** | Get suggestion details. | - | [ZSuggestion](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/suggestions/schema/suggestions.schema.ts#L5) |
| `PUT` | `/suggestions/:id` | **Admin** | Update suggestion. | [ZPartialSuggestion](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/suggestions/schema/suggestions.schema.ts#L21) | [ZSuggestion](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/suggestions/schema/suggestions.schema.ts#L5) |
| `DELETE` | `/suggestions/:id` | **Admin** | Delete suggestion. | - | [messageResponseSchema](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/auth/schema/auth.schema.ts#L29) |

---
## 📨 Messaging

| Method | Endpoint | Access | Description | Input DTO | Output DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/messaging/` | User | List all conversations for the current user. | - | [ZConversationList](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/messaging/schema/messaging.schema.ts#L30) |
| `POST` | `/messaging/` | User | Start a new conversation. | [ZNewConversation](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/messaging/schema/messaging.schema.ts#L20) | [ZConversation](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/messaging/schema/messaging.schema.ts#L3) |
| `GET` | `/messaging/:id/messages` | Participant | Get message history of a conversation. | - | [ZMessageList](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/messaging/schema/messaging.schema.ts#L31) |
| `POST` | `/messaging/:id/messages` | Participant | Send a message to a conversation. | [ZNewMessage](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/messaging/schema/messaging.schema.ts#L25) | [ZMessage](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/messaging/schema/messaging.schema.ts#L10) |

---
## 🔔 Notifications

| Method | Endpoint | Access | Description | Input DTO | Output DTO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/notifications/` | User | List recent notifications. | - | [ZNotificationList](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/notifications/schema/notifications.schema.ts#L14) |
| `PATCH` | `/notifications/:id/read` | User | Mark a notification as read. | - | - |
| `DELETE` | `/notifications/:id` | User | Delete a notification. | - | [messageResponseSchema](https://github.com/ClementMONDARY/App_BDJ-back/blob/main/src/routes/auth/schema/auth.schema.ts#L29) |
