# CampusCare DevOps Strategy

## 1. Purpose

CampusCare is designed as an end-to-end DevOps mini-project.

The DevOps workflow connects software development, version control, continuous integration, containerization, deployment, infrastructure provisioning, and monitoring.

The objective is to demonstrate how a software project moves from source code to a deployed and monitored application.

The implementation should remain practical and manageable for the ASD mini-project.

---

## 2. DevOps Pipeline

The planned high-level pipeline is:

Developer
    |
    v
Git Repository
    |
    v
Continuous Integration
    |
    +--> Code Validation
    +--> Automated Tests
    +--> AI Service Tests
    |
    v
Docker Build
    |
    v
Container Images
    |
    v
Deployment
    |
    +--> Docker Compose
    |
    +--> Kubernetes
    |
    v
Running Application
    |
    v
Monitoring
    |
    +--> Metrics
    +--> Application Health
    +--> Container/Service Health