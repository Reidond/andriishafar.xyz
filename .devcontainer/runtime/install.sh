#!/usr/bin/env bash
set -e

if [ "$(id -u)" -ne 0 ]; then
  echo -e 'Script must be run as root. Use sudo, su, or add "USER root" to your Dockerfile before running this script.'
  exit 1
fi

FEATURE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Store environment configurations during build time
mkdir -p /usr/local/share/runtime
cat "${FEATURE_DIR}/devcontainer-features.env" >/usr/local/share/runtime/devcontainer-features.env

# Generate environment JSON from individual options
cat > /usr/local/share/runtime/env.json << EOF
{
  "local": {
    "PORT": "${PORT:-3000}",
  }
}
EOF

RUN_DEV_SCRIPT_PATH="/usr/local/bin/rundev"
cat "${FEATURE_DIR}/scripts/rundev.sh" >>${RUN_DEV_SCRIPT_PATH}
chmod +x ${RUN_DEV_SCRIPT_PATH}

RUN_INSTALL_SCRIPT_PATH="/usr/local/bin/runinstall"
cat "${FEATURE_DIR}/scripts/runinstall.sh" >>${RUN_INSTALL_SCRIPT_PATH}
chmod +x ${RUN_INSTALL_SCRIPT_PATH}

RUN_ENV_SCRIPT_PATH="/usr/local/bin/runenv"
cat "${FEATURE_DIR}/scripts/runenv.sh" >>${RUN_ENV_SCRIPT_PATH}
chmod +x ${RUN_ENV_SCRIPT_PATH}

exit $?
