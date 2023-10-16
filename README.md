# Coverage Robot Action
This GitHub Action allows for accepting uploads of coverage reports conveniently into Coverage Robot.

## Usage

### Inputs
- `token` - The unique secret token to securely upload coverage files (**Required**).
- `files` - The glob patterns to match the coverage files to upload (**Required**).
- `tag` - The tag to associate with the coverage files (**Required**).
- `endpoint` - The endpoint contacted when signing coverage files before upload (**Optional**, **Default:** `https://api.coveragerobot.com/v1`).
- `github-token` - The GitHub token to use for authentication (**Optional**, **Default:** [The automatic GitHub token](https://docs.github.com/en/actions/security-guides/automatic-token-authentication#about-the-github_token-secret)).

### Example
```yaml
- uses: coverage-robot/action@v1
  with:
    token: ${{ secrets.COVERAGE_TOKEN }}
    files: |
        ./coverage/**/coverage.xml
    tag: api-service
```