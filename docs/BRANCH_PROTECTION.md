# Branch Protection & PR Guidelines

This document outlines branch protection rules and pull request guidelines.

## Branch Protection Rules

The following rules are enabled on the `main` branch:

### 1. **Require Pull Request Reviews**
- Minimum 1 approval required before merging
- Dismiss stale pull request approvals when new commits are pushed
- Require status checks to pass before merging

### 2. **Require Status Checks to Pass**
- CI/CD pipeline must pass (GitHub Actions)
- All tests must pass
- Build must succeed

### 3. **Require Branches to be Up to Date**
- Must be up to date before merging
- Automatic enforcement when new commits are pushed

### 4. **Require Conversation Resolution**
- All comments must be addressed before merging
- Ensures code review feedback is implemented

## Pull Request Process

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Write clean, well-documented code
   - Follow existing code style
   - Add comments for complex logic

3. **Run Tests Locally**
   ```bash
   # Backend
   cd server && npm run dev
   
   # Frontend
   cd client && npm run dev
   ```

4. **Commit Changes**
   ```bash
   git commit -m "feat: add new feature"
   # Use conventional commits:
   # feat: new feature
   # fix: bug fix
   # docs: documentation
   # style: formatting
   # refactor: code restructuring
   # test: adding tests
   ```

5. **Push to GitHub**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Add clear title and description
   - Reference related issues (#123)
   - Include screenshots/videos if UI changes
   - Mention breaking changes if any

7. **Address Review Comments**
   - Make requested changes
   - Push new commits (don't force push)
   - Mark conversations as resolved after implementing

8. **Merge When Ready**
   - All checks must pass
   - At least 1 approval required
   - All conversations resolved

## Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test additions/changes
- `chore`: Build, dependencies, etc.

### Example:
```
feat(auth): add password reset functionality

Implement password reset flow with email verification.
Add POST /api/auth/reset-password endpoint.

Fixes #123
```

## Naming Conventions

### Branches:
- Features: `feature/description`
- Bugfixes: `fix/description`
- Hotfixes: `hotfix/description`
- Releases: `release/v1.0.0`

### Example:
- `feature/user-profile`
- `fix/login-bug`
- `hotfix/security-vulnerability`

## Code Review Guidelines

### For Reviewers:
- Review for code quality and correctness
- Check for security issues
- Ensure tests are included
- Verify documentation is updated
- Keep feedback constructive

### For Authors:
- Respond to all comments
- Make requested changes promptly
- Ask questions if feedback is unclear
- Thank reviewers for their time

## CI/CD Pipeline

The following checks must pass:

1. **Linting**: Code style and format
2. **Tests**: Unit and integration tests
3. **Build**: Successful compilation
4. **Security**: Vulnerability scanning

Failed checks prevent merging. View logs in GitHub Actions tab.

## Deployment

### Development
- Triggered on push to `develop` branch
- Deployed to staging environment

### Production
- Triggered on push to `main` branch
- Requires all checks to pass
- Requires manual approval for deployment

## Protection Enforcement

- **Admin Override**: Only repository owners can bypass protection rules
- **Direct Commits**: Not allowed to `main` branch
- **Force Push**: Disabled on `main` and `develop` branches

---

For questions or issues with the branch protection setup, contact the repository maintainers.
