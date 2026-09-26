# Changes

Short note on what was changed and why. The original task instructions are still in `README.md`.

## File structure and pattern

The backend and the UI each started as one file. They are split so a change in one layer does not rewrite the whole app.

**Backend pattern: layered.** A request goes route, then controller, then service, then model. The route only maps the URL. The controller reads the request and sends the response. The service holds the rules. The model talks to the database. Middleware sits in front of the routes for CORS, the request id, auth, unknown paths, and errors.

```
backend_express.js          starts the process
src/server.js               connects the database and listens
src/app.js                  mounts middleware and routes
src/config/database.js      Sequelize connection from .env
src/models/                 User, Post, Comment, Like and associations
src/routes/                 URL map for auth, users, posts, comments
src/controllers/            request in, response out
src/services/               auth, users, posts, comments, likes
src/middleware/             cors, authenticate, request id, 404, errors
src/utils/                  AppError, async handler, response envelope, id check
```

**Frontend pattern: pages, components, and one API client.** A page owns a route. A component is a piece of UI reused by pages. The auth hook holds the session. Every HTTP call goes through one Axios service.

```
main.jsx                    error boundary and auth provider
frontend_react.jsx          router shell and shared styles
routes/AppRoutes.jsx        lazy routes for login, feed, trending, search, profile
pages/                      one screen per route
components/                 login, signup, post card, create post, layout, avatar, errors
hooks/useAuth.js            one session check for the whole app
services/api.js             shared Axios client
```

## Backend

- **Postgres schema.** The app runs on local Postgres, and `schema.sql` is MySQL. `schema.postgres.sql` is the version that was loaded, then the seed data.
- **Sequelize models and associations.** Fields and foreign keys were filled in so `include` can load authors, posts, comments, and likes. Comment likes were associated through `likes.comment_id`.
- **Wrong `through` include removed.** User to post is `hasMany`, not a join table. `through` made profile requests crash.
- **Real authentication.** JWT checks the `Authorization` bearer token and sets `req.user`. Protected routes were crashing because `req.user` was missing. Login issues the token. Passwords are hashed with bcrypt. Seed users still cannot log in because their hashes are not bcrypt.
- **Credentials stay in `.env`.** Database and JWT settings are read from the environment and are not committed.
- **CORS.** The Vite app on port 5173 can call the API on port 3000.
- **Layered API.** `backend_express.js` only starts the server. Middleware, database, models, routes, controllers, and services live under `src/`.
- **One response shape.** Every success and error returns `{ success, message, data, meta, error }`. Invalid ids, bad JSON, missing records, and conflicts use the same envelope.
- **Search uses `Op.iLike`.** The operator is imported at the top of the post service. Postgres search is case-insensitive.
- **Feed, search, and trending return the same post detail.** Each post includes the author, image, date, full text, comments, and counts. The screen was only getting a title snippet, and dates and images were missing.
- **`liked_by_me` on posts and comments.** A valid token on the feed, search, trending, and comment list marks what the current user already liked, so a second click can unlike.
- **Comment like and unlike.** `POST /api/comments/:id/like` and `DELETE /api/comments/:id/unlike` save a like on that comment and update `likes_count`.
- **Create post returns the saved row.** The client can replace a temporary post with the real id without reloading the feed.

## Frontend

- **Login and signup are separate screens.** The token is stored in `localStorage`. On load, one session check calls `/api/me`. A 401 clears the token and returns to login. Session state lives in one provider so the login page does not call the API in a loop.
- **Shared Axios client.** All calls go through `services/api.js`. It attaches the token and reads `data` from the response envelope.
- **Error UI.** Failed requests show a message and retry. A render crash is caught by an error boundary.
- **Pages and routes.** Feed, trending, search, and profile are separate routes. Pages are lazy-loaded.
- **Feed virtualization uses the page scroll.** Only visible posts are rendered. There is no inner scroll box.
- **Dates and authors.** Cards read `createdAt` and `post.author`, which is what Sequelize returns.
- **Layout.** Header, create-post card, and post cards follow the SocialApp preview: white cards, purple actions, and the page background.
- **Optimistic updates.** A new post, a new comment, a post like, and a comment like change the screen immediately and save in the background. The list is not reloaded. If the save fails, that change is rolled back.
- **Search shows the full post.** Results use the same card as the feed, including the image and comments.
- **Avatar fallback.** Profile, feed, and trending show initials when a photo is missing or fails to load.
- **Trending detail.** Each trending post shows the author, date, full text, image when one exists, and every comment.
- **Comment likes on feed and search.** The heart under a comment toggles that comment’s like.
