# Secure Document Link Generator

A secure way to share sensitive documents using one-time or time-limited links. Built with **Bun + NestJS + React**.

## Prerequisites

Ensure you have the following installed:

*   **Bun**: `curl -fsSL https://bun.sh/install | bash`
*   **Git**: [git-scm.com](https://git-scm.com/)

## Deployment

The application is deployed at the following URLs:

*   **Frontend**: [https://secure-document-link-generator.vercel.app/](https://secure-document-link-generator.vercel.app/)
*   **Backend API**: [https://secure-document-link-generator-production.up.railway.app/api/](https://secure-document-link-generator-production.up.railway.app/api/)

## Running the Application

To run the application, you have two options:

### Option 1: Using Docker (Recommended)

Run the entire stack with a single command:

```bash
docker compose up --build
```
-   **Frontend**: `http://localhost:5173`
-   **Backend API**: `http://localhost:3000/api`

### Option 2: Local Development

Open two terminal tabs/windows:

**1. Start Backend**
```bash
cd backend
bun start:dev
```
*   Server runs on: `http://localhost:3000`

**2. Start Frontend**
```bash
cd frontend
bun run dev
```
*   Client runs on: `http://localhost:5173`

---

## API & Testing

### Principal Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/generate-link` | `POST` | Generates a new secure link for a document. |
| `/api/docs/view/:token` | `GET` | Redeems and views the document (One-time use). |
| `/api/debug` | `GET` | **(Dev Only)** Shows all active/redeemed tokens in memory. |
| `/api/health` | `GET` | System health check. |

### Security & Validation Features

-   **One-Time Use**: Tokens are strictly single-use. Once redeemed, the record is updated and subsequent attempts return a 404.
-   **Token Expiration**: For enhanced security, links are valid for **15 minutes** from creation.
-   **Input Validation**: 
    -   `documentName` is required and must be between 3 and 50 characters.
    -   Requests failing validation return a `400 Bad Request`.
-   **Minimal Logging**: Backend tracks token generation and redemption (with masked tokens) for auditing purposes via NestJS Logger.
-   **Copy-to-Clipboard**: Frontend includes a one-click copy feature with visual feedback.

### Testing Lifecycle Example

To test the full flow via CLI:

1. **Generate a link**:
   ```bash
   curl -X POST http://localhost:3000/api/generate-link \
     -H "Content-Type: application/json" \
     -d '{"documentName": "Secret-Report.pdf"}'
   ```
   *Response: `{"token": "xyz...", "url": "..."}`*

2. **Verify in Debug**:
   Check if the token was created: `http://localhost:3000/api/debug`

3. **Redeem the link**:
   Use the token received: `http://localhost:3000/api/docs/view/xyz...`

4. **Verify One-Time Use**:
   Try accessing the same URL again. It should return an error.

### Debug Endpoint Output Example

Accessing `GET /api/debug` provides a snapshot of the in-memory database:

```json
[
  {
    "token": "f278b1b633b9d379be1e23edb329c344b34299720480b63f25d850a5d90736ff",
    "documentName": "2024-Q3-Statement.pdf",
    "createdAt": "2026-02-11 11:58:25",
    "redeemedAt": "2026-02-11 12:01:56"
  },
  {
    "token": "e0e35da7c2caff62fe4057ab6031e386146189e0278b90654cd501bc16bfbb53",
    "documentName": "2024-Q3-Statement.pdf",
    "createdAt": "2026-02-11 12:01:44",
    "redeemedAt": "2026-02-11 12:01:47"
  },
  {
    "token": "8f93b7e7227916c1bb1038e17e0f6a387c403b41eddbd45e15beeafc28f8ace6",
    "documentName": "Employment-Contract-V2.docx",
    "createdAt": "2026-02-11 12:02:05",
    "redeemedAt": null
  }
]
```

---

## Code Quality

This project uses **ESLint** and **Prettier** to ensure code consistency and quality.

To check and fix linting issues:

```bash
# Frontend
cd frontend
bun run lint

# Backend
cd backend
bun run lint
```

## Testing

The project includes comprehensive E2E tests for the backend using **Bun Test** and **Supertest**. These tests cover:
- Basic connectivity and health checks.
- Secure link generation and token issuance.
- One-time link redemption (verifying links fail after first use).
- **Link expiration logic (valid for 15 minutes).**
- **Input validation performance (invalid names, length checks).**
- Multi-document session flows.
- Debug endpoint inspection.

```bash
cd backend
bun run test:e2e
```

## Personal Highlights & Reflections

This project was a great opportunity to explore the **Bun ecosystem** for the first time. Here are a few things I'm particularly proud of:

*   🚀 **The Speed of Bun**: Coming from a traditional Node.js background, the speed of Bun is genuinely impressive. From the near-instantaneous server starts to how fast the E2E tests run (under 400ms!), it has completely changed my perspective on dev-tooling efficiency.
*   📦 **All-in-One Simplicity**: I loved using Bun not just as a runtime, but as the package manager, the test runner, and even the SQLite driver. It makes the codebase feel much leaner and easier to maintain.

## Assumptions

-   **Transient Data**: The app uses an in-memory SQLite database (`:memory:`). This is an intentional choice for this project to ensure that link data remains volatile and is never persisted to disk, adding an extra layer of privacy.
-   **Local/Docker Dev**: The setup is optimized for both local `bun` execution and a fully containerized Docker workflow.
