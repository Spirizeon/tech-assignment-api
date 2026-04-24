# SRM Full Stack Engineering Challenge

This is a Full Stack project that processes hierarchy data and returns nested tree structures, cycle detection, and summary statistics.

## Stack

- Backend: Node.js + Express
- Frontend: Plain HTML/CSS/JS
- Hosting: Vercel / Render / Railway

## Getting Started

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
  "user_id": "fullname_ddmmyyyy",
  "email_id": "your.email@college.edu",
  "college_roll_number": "21CS1001",
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
├── server.js       # Express backend server
├── index.html     # Frontend SPA
├── test.js       # Test cases
├── package.json   # Dependencies
└── .github/workflows/
    └── ci.yml    # GitHub Actions CI
```

## Deployment

Deploy to any Node.js hosting platform (Render, Railway, Vercel). The API includes CORS support for cross-origin requests.