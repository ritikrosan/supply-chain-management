# Frontend

Angular frontend for the SCM backend.

## Run in VS Code

```bash
npm install
npm start
```

The app runs on [http://localhost:4200](http://localhost:4200) and proxies `/api` to the Spring Boot backend on `http://localhost:8080`.

## Available Scripts

- `npm start`: start Angular dev server with backend proxy
- `npm run build`: production build
- `npm test`: unit tests

## Expected Backend

Start the Spring Boot app from [backend](/D:/scm/scm/backend) first, preferably in STS.
