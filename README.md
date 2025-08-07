Wabi Dashboard

## 🔄 GitHub Actions

Whenever a new commit is pushed to the `main` branch, a GitHub Actions workflow automatically attempts to merge `main` into `staging`.

- ✅ If the merge succeeds: `staging` is updated automatically, no further action needed.
- ❌ If the merge **fails due to a conflict**, the workflow will:
  - Skip pushing the changes
  - Automatically create a GitHub Issue titled `❌ Merge Conflict: main → staging` for manual intervention

### 🧯 What to Do If a Merge Conflict Issue Is Created

When a conflict issue appears:

1. Checkout the `staging` branch locally
2. Manually merge `main` into `staging`
3. Resolve any merge conflicts
4. Commit and push the changes to `staging`
5. Finally, comment on and close the GitHub Issue to indicate the conflict has been resolved
