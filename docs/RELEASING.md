# Release process

Releases follow Semantic Versioning. A published version is immutable; fixes require a new version.

## 1. Prepare the release

1. Ensure `main` is current and the working tree is clean.
2. Move relevant entries from `Unreleased` in `CHANGELOG.md` into a dated version section.
3. Choose the version:
   - patch for backward-compatible fixes;
   - minor for backward-compatible functionality;
   - major for breaking public API changes.
4. Update `package.json` and `package-lock.json` with `npm version --no-git-tag-version <version>`.
5. Commit these changes as `[Release]: Prepare version x.y.z`.

## 2. Verify the artifact

```bash
npm ci
npm run check
npm test
npm audit
npm pack --dry-run
```

Inspect the tarball contents shown by `npm pack --dry-run`. The package should contain the license, README, compiled ESM/CommonJS files, declarations, and package metadata—never source credentials, environment files, test fixtures with private data, or local artifacts.

## 3. Publish

```bash
npm publish --access public --provenance
```

Complete npm authentication and 2FA using the maintainer account. Verify the exact version from a clean directory:

```bash
npm view paysharp-node version
npm install paysharp-node@x.y.z
```

Smoke-test both ESM `import` and CommonJS `require` before announcing the release.

## 4. Tag and document

After registry verification:

```bash
git tag -a vx.y.z -m "paysharp-node x.y.z"
git push origin vx.y.z
```

Create a GitHub release from the tag using the matching changelog section. If publication fails, do not reuse a version that reached the npm registry; increment it and document the reason.

## Deprecations

Deprecations must include an alternative and a removal timeline. Use runtime warnings sparingly, update TSDoc with `@deprecated`, add migration guidance, and record the change under `Deprecated` in the changelog.
