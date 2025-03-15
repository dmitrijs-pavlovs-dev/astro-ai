# Astro AI - Astrocartography Application

## Project Overview

Astro AI is an advanced astrocartography application that helps users discover how different locations on Earth resonate with their astrological birth chart. The application allows users to:

1. Input their birth data (date, time, location)
2. Ask natural language questions about locations (e.g., "Where's the best place for my career?")
3. View interactive maps with highlighted areas showing astrological "power zones"
4. Receive AI-generated interpretations of how locations align with their chart

## Tech Stack

- **Frontend**: Next.js, React, TanStack Query
- **Map Visualization**: Mapbox GL (for heatmaps and interactive maps)
- **Backend**: tRPC, Drizzle ORM, Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite-based serverless database)
- **Geospatial Processing**: Turf.js running on Workers for server-side calculations
- **AI/NLP**: Integration with LLM for natural language processing
- **Astro Calculations**: Custom implementation of astrocartography algorithms

## Implementation Plan

### Epic 1: Project Setup and Infrastructure

**Goal**: Establish the foundational architecture and development environment

#### Tasks:

- [x] Initialize monorepo structure with packages for API, UI, and app
- [ ] Configure development environment with TypeScript, ESLint, and Prettier
- [ ] Set up Cloudflare D1 database
- [ ] Configure Cloudflare Workers for serverless API endpoints
- [ ] Create Drizzle ORM schema and migrations

### Epic 2: Astrological Calculation Engine

**Goal**: Implement core astrocartography calculation logic

#### Tasks:

- [ ] Research and implement planetary position calculations (ephemeris)
- [ ] Implement logic to generate Ascendant, Midheaven, Descendant, and IC lines
- [ ] Create functions to project planetary lines onto Earth's geography
- [ ] Store planetary lines as coordinates in D1

### Epic 3: Geospatial Data Management

**Goal**: Build robust storage and querying capabilities for geospatial data

#### Tasks:

- [ ] Design D1 schema for storing coordinates of planetary lines
- [ ] Implement Worker-based Turf.js functions for buffer generation (300km influence zones)
- [ ] Create Worker API endpoints for querying locations near planetary lines
- [ ] Implement Workers KV caching for frequently accessed geospatial calculations
- [ ] Create city/location database with coordinates

### Epic 4: Natural Language Processing & AI Integration

**Goal**: Enable intuitive interaction through natural language questions

#### Tasks:

- [ ] Research and select appropriate LLM for astrological interpretation
- [ ] Create mapping between question types and relevant planetary lines
- [ ] Implement weighting system for different planets based on question context
- [ ] Develop response generation for location recommendations

### Epic 5: Frontend Map Visualization

**Goal**: Create intuitive and visually appealing map interfaces

#### Tasks:

- [ ] Set up Mapbox GL integration in Next.js frontend
- [ ] Implement heatmap visualization using Worker-generated geospatial data
- [ ] Create UI for birth data input and validation
- [ ] Design and implement natural language question interface

### Epic 6: User Experience & Features

**Goal**: Enhance the application with user-centric features

#### Tasks:

- [ ] Implement user authentication with Cloudflare Access or JWT
- [ ] Create system for saving birth data
- [ ] Create detailed location reports with astrological interpretations

### Epic 7: Testing & Optimization

**Goal**: Ensure application reliability, performance, and accuracy

#### Tasks:

- [ ] Develop unit tests for astrological calculations
- [ ] Create integration tests for API endpoints
- [ ] Optimize Worker-based geospatial calculations for performance
- [ ] Implement chunking strategies for complex calculations to avoid timeouts
- [ ] Validate astrological calculations against established sources

### Epic 8: Deployment & Launch

**Goal**: Prepare and execute production deployment

#### Tasks:

- [ ] Set up production environment on Cloudflare
- [ ] Configure monitoring and logging
- [ ] Implement error tracking

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
