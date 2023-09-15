alias python39='/Library/Frameworks/Python.framework/Versions/3.9/bin/python3'
. "$HOME/.cargo/env"

# NVM initialisation
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm

export DENO_INSTALL="/Users/fwtaen/.deno"
export PATH="$DENO_INSTALL/bin:$PATH"
export FLYCTL_INSTALL="/Users/fwtaen/.fly"
export PATH="$FLYCTL_INSTALL/bin:$PATH"

alias brew='arch -x86_64 brew'
alias vps='ssh -i ~/.ssh/vps.pem ec2-user@ec2-34-251-4-208.eu-west-1.compute.amazonaws.com'

