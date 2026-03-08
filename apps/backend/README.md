# FinoSync Backend

Rails 8 API-only app for FinoSync personal finance management.

## Requirements

- Ruby (see `.ruby-version`)
- SQLite3
- Redis (for Sidekiq)
- [Doppler CLI](https://docs.doppler.com/docs/install-cli) for secret management

## Environment Variables

This project uses **Doppler** for secret management. Never commit real secrets.

```bash
# One-time Doppler setup
doppler setup

# See all required variables
cat .env.example
```

To generate Active Record Encryption keys (add the output to Doppler):
```bash
bundle exec rails db:encryption:init
```

## Getting Started

```bash
# Install dependencies
bundle install

# Set up database
doppler run -- bundle exec rails db:migrate
doppler run -- bundle exec rails db:seed

# Start server
doppler run -- bundle exec rails server

# Start background jobs
doppler run -- bundle exec sidekiq
```

## Testing

```bash
bundle exec rspec               # All tests
bundle exec rspec spec/path     # Single file
```

## Linting & Security

```bash
bundle exec rubocop             # Ruby style
bundle exec brakeman            # Security scan
```

## Deployment

Deployed via **Kamal** (Docker-based). Config at `.kamal/`. Doppler injects secrets at runtime in production.
