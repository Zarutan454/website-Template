# Development Environment Startup Guide

This guide explains how to start the complete BSN application for local development. The application consists of several components that need to run simultaneously.

## Overview

For the application to be fully functional, you need to run **four separate processes** in four different terminals:
1.  **Frontend Server:** The React user interface.
2.  **Backend Server:** The Django API that serves data.
3.  **Celery Worker:** Executes background tasks (e.g., calculating mining results, sending notifications).
4.  **Celery Beat Scheduler:** Schedules periodic tasks (e.g., cleaning up expired boosts).

**Note on Redis:** For local development, we use a simple in-memory message broker provided by Celery, so you do **not** need to install or run a separate Redis server. For a production environment, a dedicated broker like Redis or RabbitMQ would be required.

---

## Step-by-Step Instructions

Open four separate PowerShell terminals. In each terminal, navigate to the project's root directory (`website-Template`).

### Terminal 1: Start the Frontend

This terminal will run the Vite development server for our React UI.

1.  **Command:**
    ```powershell
    npm run dev
    ```
2.  **Purpose:** Starts the frontend application.
3.  **Access:** You can access the UI in your browser, usually at `http://localhost:8080`.

---

### Terminal 2: Start the Backend (Django)

This terminal runs the main Django API server that the frontend communicates with.

1.  **Navigate to the backend directory:**
    ```powershell
    cd backend
    ```
2.  **Activate the Python virtual environment:**
    ```powershell
    .\venv\Scripts\Activate.ps1
    ```
3.  **Start the Django server:**
    ```powershell
    python manage.py runserver
    ```
4.  **Purpose:** Runs the main API server.

---

### Terminal 3: Start the Celery Worker

This process listens for and executes tasks sent by the backend.

1.  **Navigate to the backend directory:**
    ```powershell
    cd backend
    ```
2.  **Activate the Python virtual environment:**
    ```powershell
    .\venv\Scripts\Activate.ps1
    ```
3.  **Start the Celery worker:**
    ```powershell
    celery -A bsn worker --loglevel=info --pool=threads
    ```
4.  **Purpose:** This worker executes tasks as they are received. The `--pool=threads` argument is crucial for Windows compatibility.

---

### Terminal 4: Start the Celery Beat Scheduler

This process schedules recurring tasks.

1.  **Navigate to the backend directory:**
    ```powershell
    cd backend
    ```
2.  **Activate the Python virtual environment:**
    ```powershell
    .\venv\Scripts\Activate.ps1
    ```
3.  **Start the Celery Beat scheduler:**
    ```powershell
    celery -A bsn beat --loglevel=info
    ```
4.  **Purpose:** This scheduler is responsible for queuing periodic jobs, such as the task to clean up expired mining boosts every 30 minutes.

---

## Summary

After following these steps, you will have a fully operational development environment:
-   A running frontend at `http://localhost:8080`.
-   A running backend at `http://localhost:8000`.
-   A running Celery worker ready to process tasks.
-   A running Celery scheduler queuing up periodic tasks. 