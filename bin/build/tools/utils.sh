#!/bin/bash

function errcho {	
    >&2 echo -en '\E[31m'"\033[1merror: $*\033[0m"
    exit 1
}

function echoDate {
	echo '['$(date +'%Y-%m-%d %H:%M:%S')']'
}

#--- getTotalBuildtime() ------------------------
#  @param $1 startDate
#  @param $2 endDate
##
function getTotalBuildTime() {
	diffTime=$(($2 - $1))	

	#mm:ss
	printf "Total build time: %02d:%02d\n" "$(($diffTime/60%60))" "$(($diffTime%60))"
}