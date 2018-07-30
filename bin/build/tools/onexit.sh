#!/bin/bash

#since this script can be launch from the build, we need to get the path of the first script that was executed
currentDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
. $currentDir/utils.sh

#http://fvue.nl/wiki/Bash:_Error_handling

    # Let shell functions inherit ERR trap.  Same as `set -E'.
set -o errtrace 
    # Trigger error when expanding unset variables.  Same as `set -u'.
set -o nounset
    #  Trap non-normal exit signals: 1/HUP, 2/INT, 3/QUIT, 15/TERM, ERR
    #  NOTE1: - 9/KILL cannot be trapped.
    #+        - 0/EXIT isn't trapped because:
    #+          - with ERR trap defined, trap would be called twice on error
    #+          - with ERR trap defined, syntax errors exit with status 0, not 2
    #  NOTE2: Setting ERR trap does implicit `set -o errexit' or `set -e'.
trap onexit 1 2 3 15 ERR
 
 
#--- onexit() -----------------------------------------------------
#  @param $1 integer  (optional) Exit status.  If not set, use `$?'
 
function onexit {
	local exit_status=${1:-$?}
	
	if (($exit_status == 1))
	then
		echo -en '\E[31m'"\033[1mBUILD FAILED\033[0m"
	else
		echo -en '\E[32m'"\033[1mBUILD SUCCESS\033[0m"
	fi
	echo
    exit $exit_status
}