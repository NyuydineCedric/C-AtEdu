# C-AtEdu — Automated MCQ Question Marking Platform

## Setup

```bash
npm install
```

---

## Running the app

### Option A — With Cedric AI (free, recommended)

**Step 1:** Get a FREE Gemini API key

- Go to https://aistudio.google.com/apikey
- Sign in with a Google account
- Click "Create API Key"
- No credit card needed

**Step 2:** Add your key to `.env`

```bash
cp .env.example .env
# Open .env and set:  GEMINI_API_KEY=your-key-here
```

**Step 3:** Start everything

```bash
npm start
```

This launches:

- Frontend at **http://localhost:5173**
- Cedric AI proxy at **http://localhost:3001**

### Option B — Without AI (no setup needed)

```bash
npm run dev
```

Everything works except Cedric AI question generation.

---

## Why a proxy?

Browsers block direct API calls due to CORS. The proxy (`proxy.mjs`) is a
tiny Express server that sits between the browser and Gemini, forwarding
requests and injecting your API key server-side so it stays secure.

---

## Demo Credentials

**Teachers**
| Email | Password |
|-------|----------|
| isabelle@catedu.edu | teacher123 |
| paul@catedu.edu | teacher123 |

**Students** (login with matricule)
| Matricule | Name |
|-----------|------|
| UBa24PB180 | Alice Mbah |
| UBa24PB181 | Boris Tabi |
| UBa24CS101 | Clara Fon |
| UBa23MT220 | David Etah |
| UBa24PB182 | Esther Njong |

Or register a new account from the login page.
