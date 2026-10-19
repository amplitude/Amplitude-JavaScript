# Amplitude JavaScript SDK

This repository contains the JavaScript SDK for Amplitude Analytics.

## Project Overview

- **Language**: JavaScript (ES6+)
- **Build Tool**: Rollup
- **Test Framework**: Mocha + Karma
- **Package Manager**: Yarn
- **Main Entry Point**: `src/amplitude-client.js`

## Key Commands

- `yarn install` - Install dependencies
- `yarn build` - Build the SDK
- `yarn test` - Run tests
- `yarn lint` - Run linting
- `yarn fix` - Auto-fix linting issues

## Code Structure

- `src/` - Source code for the SDK
- `test/` - Test files
- `website/` - Documentation site (Docusaurus)
- `scripts/` - Build and utility scripts

## Important Notes

- This is a client-side analytics tracking library
- The main client is defined in `src/amplitude-client.js`
- Configuration options are in `src/options.js`
- The SDK supports both browser and Node.js environments

## Development Guidelines

- Follow existing code style (Prettier + ESLint configured)
- Write tests for new features
- Update documentation when adding public APIs
- Keep backwards compatibility in mind
