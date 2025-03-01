#!/usr/bin/env bash
set -e

# Usage information
usage() {
  # Read environment configurations from JSON file
  ENVIRONMENTS=$(cat /usr/local/share/runtime/env.json)

  # Get available environments from JSON keys
  ENVIRONMENT=$(echo "$ENVIRONMENTS" | jq -r 'keys | join(",")')

  echo "Usage: runenv <environment> [command]"
  echo "Supported environments: ${ENVIRONMENT}"
  exit 1
}

# Set environment variables based on environment
set_env_vars() {
  # Read environment configurations from JSON file
  ENVIRONMENTS=$(cat /usr/local/share/runtime/env.json)

  # Parse the JSON and extract environment variables
  config=$(echo "$ENVIRONMENTS" | jq -r --arg env "$1" '.[$env] // empty')

  if [ -z "$config" ]; then
    echo "Error: Unknown environment '$1'"
    usage
  fi

  # Dynamically export all environment variables from the config
  while IFS="=" read -r key value; do
    if [ -n "$key" ]; then
      export "$key"="$value"
    fi
  done < <(echo "$config" | jq -r 'to_entries | .[] | "\(.key)=\(.value)"')

  echo "Environment set to $1"
}

# Check if environment argument is provided
if [ $# -lt 1 ]; then
  usage
fi

set_env_vars "$1"

# If command is provided, execute it
if [ $# -gt 1 ]; then
  shift
  exec "$@"
fi

# Otherwise start a new shell
exec $SHELL
