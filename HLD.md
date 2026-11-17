# High-level design

SocialApp is a single-page React client talking to one Express API, backed by Postgres. Logged-in browsers also keep a WebSocket open so a like or a delete can update other screens without reloading the feed.

## Goals

- Sign in, then read and write posts, comments, and likes.
- Keep one response shape for every API, including errors.
- Show a long feed without rendering every post at once.
- Tell other signed-in users when a post is liked or deleted.

## System context

```
Browser (Vite, React)
  |  HTTPS-style HTTP  /api
  |  WebSocket         /ws
  v
Express (one Node process)
  route -> controller -> service -> Sequelize
  v
Postgres (users, posts, comments, likes)
```

The browser never talks to the database. A like or delete is an HTTP request. After that write succeeds, the API pushes a small event on the socket. The socket does not perform the like or the delete.

## Frontend

| Piece | Role |
| --- | --- |
| `main.jsx` | Error boundary, auth, notification connection |
| `routes/AppRoutes.jsx` | Lazy routes: login, signup, feed, trending, search, profile |
| `pages/` | One screen per route |
| `components/` | Shared UI: post card, create post, avatar, layout, errors |
| `hooks/useAuth.js` | One session check (`GET /api/me`) for the whole app |
| `hooks/useNotifications.jsx` | Opens the socket, shows notices, patches lists |
| `services/api.js` | Axios client: adds the bearer token, reads `data` from the envelope |

The token lives in `localStorage`. A 401 clears it and returns the user to login.

The feed uses a window virtualizer: the page scrolls, and only posts near the viewport are rendered. Creating a post, adding a comment, and toggling a like update the screen first, then save. If the save fails, that change is rolled back.

## Backend

Request path: middleware, route, controller, service, model.

| Layer | Role |
| --- | --- |
| `src/server.js` | Connects Postgres, listens, attaches the WebSocket server |
| `src/app.js` | CORS, JSON body, routes, 404, error handler |
| `src/routes/` | URL map only |
| `src/controllers/` | Read the request, send the response, publish realtime events |
| `src/services/` | Rules: auth, ownership, validation, queries |
| `src/models/` | Sequelize models and associations |
| `src/middleware/` | CORS, request id, JWT, unknown routes, errors |
| `src/utils/` | `AppError`, async handler, response envelope, id check |
| `src/realtime/notifications.js` | Socket connections and `publish` |

Every response is `{ success, message, data, meta, error }`.

Auth is a JWT in `Authorization: Bearer`. Protected routes need `req.user`. Public reads can still see who is calling when a valid token is present, so the feed can mark `liked_by_me`.

## Data

Four tables: `users`, `posts`, `comments`, `likes`.

- A post belongs to one user (`posts.user_id`).
- A comment belongs to one post and one user.
- A like belongs to one user and either a post (`comment_id` is null) or a comment.
- `likes_count` is stored on the post and on the comment and updated in the same request as the like row.

Associations exist so Sequelize `include` can return the author and the comments with a post. They are not a second copy of the foreign keys.

## Main flows

**Login.** `POST /api/login` checks bcrypt, returns a JWT and the public user. The app stores the token and calls `GET /api/me` on the next load.

**Feed.** `GET /api/posts` loads posts with author and comments, then marks which posts and comments the caller already liked. The page renders that list.

**Like.** `POST /api/posts/:id/like` reads the post, checks for an existing like, inserts the like, increments `likes_count`, reloads the post, then loads the liker’s username. That is 6 queries. Unlike is the same count: find post, find like, delete it, decrement the count, reload, load the username. The socket send is not a query.

**Delete.** Only the owner can delete. The row is removed, then a `post_deleted` event is published.

**Comment like.** Saved through `POST /api/comments/:id/like`. It updates the comment count in the database. It does not publish a socket event.

## Realtime

The browser opens `ws://localhost:3000/ws?token=...` after login. The server checks the JWT and stores `userId` on that socket. The client does not send like or delete commands on the socket.

`publish` sends the event to every open socket. The browser:

- patches the feed, search, and trending lists already on screen (no second `GET /api/posts`)
- shows a notice to everyone except the user who clicked (`actorId`)

A delete or like done with SQL, outside the API, does not call `publish`, so no notice is sent.

## What is intentionally simple

- One Node process. Sockets are an in-memory set. A second process would not see them.
- If the socket drops, the client reconnects after 2 seconds, except when the close code is 4001 (bad token). Missed events are not replayed.
- Notices are not stored. Refreshing the page clears them. The feed reload shows the current database state.
