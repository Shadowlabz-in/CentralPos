# Contributing Guide

## Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run tests: `pnpm --filter server test`
5. Ensure TypeScript compiles: `npx -w server tsc --noEmit` and `npx -w client tsc --noEmit`
6. Commit with descriptive messages
7. Push and create a Pull Request

## Pull Request Guidelines

- Keep PRs focused on a single concern
- Add tests for new functionality
- Update documentation when changing APIs
- Ensure all CI checks pass

## Code of Conduct

Be respectful, constructive, and inclusive.
