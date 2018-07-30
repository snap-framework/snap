#!/bin/bash

. ./tools/onexit.sh
. ./tools/utils.sh

#used in order to know the time the build has taken to complete
start=`date +%s`

main() {
	buildStart
	readVersions
	buildCSS
	buildRequire
	replaceVersions
	buildEnd
	echo Last Build date: $(echoDate) > build.log
}

buildStart() {
	echoDate
	echo -en '\E[36m'"\033[1m-----------------------------\033[0m"
	echo
	echo -en '\E[36m'"\033[1m---------BUILD START---------\033[0m"
	echo
	echo -en '\E[36m'"\033[1m-----------------------------\033[0m"
	echo
}

readVersions() {
	echo -en '\E[33m'"\033[1mConfigs\033[0m"
	echo 
	source ../../versions.txt
	
	echo "Framework version: $FWversion"
	echo "WET Version: $WETversion"
	echo
}
buildCSS() {
	echoDate
	echo -en '\E[33m'"\033[1mSCSS minimification\033[0m"
	echo 
	echo Building SCSS, minimificating and optimizing CSS...
	npm run build-css
	echo Done
	echo
}
buildRequire() {
	echoDate
	echo -en '\E[33m'"\033[1mJavascript and CSS optimization\033[0m"
	echo 
	node ..\\..\\core\\js\\lib\\r.js -o build.js
	echo
}

replaceVersions() {
	echoDate
	echo -en '\E[33m'"\033[1mReplacing versions\033[0m"
	echo 
	. ./tools/replaceVersions.sh
	echo
}

buildEnd() {
	echoDate
	end=`date +%s`
	echo $(getTotalBuildTime start end)
}


main

onexit