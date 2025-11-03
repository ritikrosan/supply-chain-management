# SCM Project (Spring Boot + Angular)

A simple Supply Chain Management demo with a Spring Boot backend and Angular frontend.

## Prerequisites
- Java 17+ (JDK)
- Node.js 18+ and npm
- Angular CLI: `npm i -g @angular/cli`
- MySQL Server

## Project Structure
```
scm/
  backend/   # Spring Boot app (Gradle wrapper included)
  frontend/  # Angular app
```

## Backend (Spring Boot)
1. Configure database (MySQL) in `backend/src/main/resources/application.properties` or via env vars.
   - File settings (edit as needed):
     - `spring.datasource.url=jdbc:mysql://localhost:3306/scm_db?createDatabaseIfNotExist=true&allowPublicKeyRetrieval=true&useSSL=false&serverTimezone=UTC`
     - `spring.datasource.username=YOUR_USER`
     - `spring.datasource.password=YOUR_PASSWORD`
   - Or set environment variables in PowerShell before run:
     - `$env:SPRING_DATASOURCE_USERNAME='YOUR_USER'`
     - `$env:SPRING_DATASOURCE_PASSWORD='YOUR_PASSWORD'`
2. Start the backend (Windows PowerShell):
   - `cd backend`
   - `./gradlew.bat bootRun`
3. Verify:
   - Health: http://localhost:8080/api/health → `{ "status": "UP" }`
   - API base: http://localhost:8080/api

## Frontend (Angular)
1. Install dependencies:
   - `cd frontend`
   - `npm ci` (or `npm install`)
2. Run dev server:
   - `ng serve`
   - Open http://localhost:4200/
3. Demo login credentials (client-side):
   - Username: `supply@123`
   - Password: `supply@99`

## CORS
Backend allows `http://localhost:4200` (and `http://localhost:4000`) in `backend/src/main/java/com/example/scm/config/CorsConfig.java`.

## Building frontend for production (optional)
- `cd frontend && ng build`
- Serve the built files (example):
  - `npx http-server dist/scm-frontend/browser -p 4000`

## Packaging/ZIP guidance
When zipping the project to share:
- Include entire `scm/` folder but exclude heavy build artifacts:
  - Exclude: `backend/build/`, `backend/.gradle/`, `frontend/node_modules/`, `frontend/dist/`
- The receiver should run the steps above under Backend and Frontend to set up locally.

## Troubleshooting
- Tailwind/PostCSS error during Angular build:
  - Ensure `frontend/postcss.config.js` only contains autoprefixer and there is NO `tailwind.config.js` file.
  - Run `npx ng cache clean` then `ng serve`.
- Backend cannot connect to MySQL:
  - Confirm MySQL is running, user/password correct, and user has privileges to create/use `scm_db`.
- Port conflicts:
  - Change backend port in `backend/src/main/resources/application.properties` with `server.port=8081`.

## Notes
- The login is purely client-side for demo purposes. For real authentication, implement server-side auth (e.g., Spring Security + JWT) and update the frontend accordingly.
