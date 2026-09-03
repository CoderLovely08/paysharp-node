# Contributing

Thanks for helping improve `paysharp-node`. Contributions should remain small, reviewable, and grounded in PaySharp's published API documentation or reproducible sandbox behavior.

## Development setup

```bash
git clone https://github.com/CoderLovely08/paysharp-node.git
cd paysharp-node
npm install
npm run check
npm test
```

Node.js 18 is the minimum supported version. CI also verifies current active and maintenance Node.js releases.

## Making changes

1. Create a focused branch from `main`.
2. Add or update tests for behavior changes.
3. Update TSDoc and Markdown documentation when the public API changes.
4. Run `npm run check`, `npm test`, and `npm pack --dry-run`.
5. Open a pull request explaining the motivation, behavior, and verification performed.

Do not include merchant tokens, base URLs tied to private accounts, customer data, complete webhook payloads from production, or unredacted PaySharp dashboard screenshots.

## Commit messages

Use the repository's bracketed commit convention:

```text
[Type]: Concise imperative description
```

Common types include:

- `[Feature]` for new user-facing functionality
- `[Fix]` for defects and incorrect behavior
- `[Docs]` for documentation-only changes
- `[Test]` for test coverage and fixtures
- `[CI]` for continuous-integration changes
- `[Security]` for security improvements
- `[Performance]` for measured performance improvements
- `[Refactor]` for behavior-preserving code changes
- `[Chore]` for maintenance work
- `[Release]` for version releases
- `[Deprecated]` for deprecation notices and migrations

Keep each commit limited to one coherent change. Do not split changes merely to increase commit count.

## API changes

When adding or changing an endpoint:

- Link the relevant official documentation in the pull request.
- Model request and response fields in `src/types.ts`.
- Put request behavior in the appropriate resource class.
- Validate only constraints explicitly documented by PaySharp.
- Add an endpoint mapping test and validation/error cases.
- Preserve compatibility unless the change is intentionally breaking.

## Pull-request review

A change is ready to merge when CI passes, its public behavior is documented, its tests fail without the implementation where practical, and no secrets or customer data are present.
