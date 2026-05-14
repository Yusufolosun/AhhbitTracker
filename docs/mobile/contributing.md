# Contributing to AhhbitTracker Mobile

We welcome contributions to the AhhbitTracker mobile app! To maintain high code quality and consistency, please follow these guidelines.

## Code Standards

- **TypeScript**: Use strict typing. Avoid `any` at all costs.
- **Naming**: Use PascalCase for components and camelCase for hooks, variables, and functions.
- **Formatting**: We use Prettier for code formatting. Ensure your editor is configured to use the project's `.prettierrc`.

## Pull Request Process

1.  **Branching**: Create a feature branch from `main` (e.g., `feature/mobile-new-metric`).
2.  **Commits**: Use granular, atomic commits with descriptive messages following the [Conventional Commits](https://www.conventionalcommits.org/) specification.
3.  **Testing**: Verify your changes on both iOS and Android (via Expo Go) if possible. Run `npm run check` to ensure no type errors were introduced.
4.  **Documentation**: If your change adds a new feature or architectural pattern, update the relevant documentation in `docs/mobile/`.

## Review Criteria

- Correctness of blockchain integration logic.
- Adherence to the design system and mobile UI best practices.
- Proper handling of error states and loading transitions.
- Security of data handling and wallet handoffs.
