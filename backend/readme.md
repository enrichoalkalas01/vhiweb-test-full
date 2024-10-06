# Backend API - Node.js Express Project

This is a basic structure for a scalable Node.js backend using Express.js. The project follows a modular architecture to ensure clean separation of concerns and easier maintainability as the application grows.

## Table of Contents
- [Features](#features)
- [Folder Structure](#folder-structure)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Environment Variables](#environment-variables)
- [Migrations](#migrations)
- [API Routes](#api-routes)
- [Contributing](#contributing)
- [License](#license)

## Features
- Authentication For Admin & Vendors
- Vendors Registration & Approval
- Product Catalog For Vendors

- Modular folder structure following best practices
- Middleware for authentication and error handling
- Service layer for handling business logic
- Sequelize ORM for database interactions
- Environment configuration for different environments
- Database migrations for managing schema changes

## Folder Structure

```bash
|-- src
|   |-- configs         # Configuration files for database and environment
|   |-- controllers     # Controllers to handle incoming HTTP requests
|   |-- middlewares     # Middleware functions for authentication, error handling, etc.
|   |-- migrations      # Database migration files for schema management
|   |-- models          # Sequelize models representing the database structure
|   |-- routes          # API route definitions
|   |-- services        # Business logic and database interaction functions
|   |-- utils           # Utility functions like helpers or common logic
|   |-- libs            # External libraries or integrations (e.g. third-party API)
|
|-- app.js              # Entry point of the application
|-- package.json        # NPM dependencies and scripts
|-- Dockerfile          # Docker configuration for containerizing the app
