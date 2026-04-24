# SRM Full Stack Engineering Challenge

This is a Full Stack project that processes hierarchy data and returns nested tree structures, cycle detection, and summary statistics.

## Deployed URLs

- **Frontend**: https://tech-assignment-frontend.pages.dev
- **Backend API**: https://tech-assignment-api.vercel.app/bfhl

## Stack

- Backend: Node.js + Express
- Frontend: Plain HTML/CSS/JS

## Deployable Files

### Frontend (Vercel/Cloudflare Pages)
- `index.html` - Static HTML file, no build command needed.

### Backend (Vercel)
- `server.js` - Deploy as Vercel serverless function or to Render/Railway.

## Local Development

### Install Dependencies

```bash
npm install
```

### Run the Server

```bash
npm start
```

The server will start on http://localhost:3000

### Run Tests

```bash
npm test
```

## Docker Deployment

### Backend Only

```bash
docker build -f Dockerfile.backend -t backend .
docker run -p 3000:3000 backend
```

### Full Stack

```bash
docker compose up --build
```

- Backend: http://localhost:3000
- Frontend: http://localhost:8080

## Testing the API

```bash
curl -X POST https://tech-assignment-api.vercel.app/bfhl \
  -H "Content-Type: application/json" \
  -d '{"data": ["A->B", "A->C", "B->D"]}'
```

## API Endpoint

### POST /bfhl

**Request:**
```json
{
  "data": ["A->B", "A->C", "B->D"]
}
```

**Response:**
```json
{
  "user_id": "ayushdutta_11112004",
  "email_id": "dutta_ayush@srmap.edu.in",
  "college_roll_number": "AP23110011131",
  "hierarchies": [
    {
      "root": "A",
      "tree": { "B": {}, "C": {} },
      "depth": 2
    }
  ],
  "invalid_entries": [],
  "duplicate_edges": [],
  "summary": {
    "total_trees": 1,
    "total_cycles": 0,
    "largest_tree_root": "A"
  }
}
```

## Features

- Validates edge format (X->Y where X, Y are single uppercase letters A-Z)
- Detects and reports invalid entries
- Detects and handles duplicate edges
- Builds nested tree structures from valid edges
- Detects cycles in graphs
- Calculates tree depth
- Provides summary statistics

## Project Structure

```
├── server.js              # Express backend server
├── index.html            # Frontend SPA (static)
├── Dockerfile.backend    # Backend container
├── Dockerfile.frontend  # Frontend container (nginx)
├── docker-compose.yml  # Full stack compose
├── test.js              # Test cases
├── package.json         # Dependencies
└── .github/workflows/   # CI/CD workflows
    ├── ci.yml          # Test workflow
    └── ghcr.yml        # GHCR push workflow
```