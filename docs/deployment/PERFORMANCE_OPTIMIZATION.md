# BSN Website Performance Optimization Guide

## Performance Optimizations Implemented

### 1. Vite Configuration Optimizations
- Bundle Splitting for better caching
- Terser minification with compression
- Modern browser targeting (ES2020+)
- CSS code splitting

### 2. Asset Optimization
- WebP image format with fallbacks
- Font preloading and optimization
- Lazy loading implementation

### 3. Performance Monitoring
- Web Vitals tracking
- Real User Monitoring
- Lighthouse CI integration

# Performance Optimization Strategies

This document outlines the strategies implemented to improve the performance and scalability of the BSN platform.

## 1. Caching Mining Statistics

### Problem

The `GET /api/mining/stats/` endpoint was identified as a performance bottleneck. For every request, the system would perform several database queries to calculate the user's current mining rate, including fetching all active boosts and other progress data. This resulted in high database load, especially with frequent requests from the frontend to update the UI.

### Solution

A caching layer has been implemented for the mining statistics to significantly reduce the database load and improve response times.

- **Strategy:** Server-side caching using Django's cache framework.
- **Implementation:**
  - The `MiningService.get_user_mining_stats` method now serves as the single source for fetching user mining data.
  - When a user's stats are requested for the first time, they are calculated via database queries and then stored in the cache.
  - A unique cache key is generated for each user (e.g., `mining_stats_<user_id>`).
  - The cached data has a **timeout of 5 minutes (300 seconds)**.
  - Subsequent requests within this 5-minute window will receive the data directly from the cache, bypassing database queries entirely.
  - After 5 minutes, the cache for that user expires, and the next request will trigger a fresh calculation, which is then re-cached.

### Impact

- **Reduced Database Load:** Drastically decreases the number of read operations on the `MiningProgress` and `MiningBoost` tables.
- **Faster API Response Time:** Users receive their mining statistics almost instantly on subsequent requests.
- **Improved Scalability:** The system can handle a much higher volume of concurrent users requesting their stats without degrading performance.

## 2. Asynchronous Task Processing with Celery

### Problem

Certain actions, like cleaning up expired data, can be time-consuming and, if run synchronously, could block web server processes and degrade the user experience.

### Solution

Celery, a distributed task queue, has been integrated to handle long-running and periodic tasks asynchronously.

- **Strategy:** Offload specific tasks to background workers.
- **Implementation:**
  - **Celery Worker & Beat:** A Celery worker (using `--pool=threads` for Windows compatibility) and a Celery Beat scheduler have been configured.
  - **Task: `cleanup_expired_boosts`**: A periodic task has been created to run every 30 minutes. This task finds and deactivates all expired `MiningBoost` objects in the database.
  - **Broker:** Redis is used as the message broker between the Django application and the Celery workers.

### Impact

- **Improved Responsiveness:** Web requests are not blocked by long-running cleanup processes.
- **System Maintenance:** Ensures the database is regularly maintained without manual intervention or performance degradation during peak times.
- **Scalability:** The task queue architecture allows for scaling the number of workers independently from the web application servers as the number of background tasks grows.

---
Last Updated: December 2024
Status: Implemented
