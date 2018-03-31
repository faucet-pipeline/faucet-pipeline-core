set -euo pipefail

# enters test directory
function begin {
	test_dir="${1:?}"

	echo; echo `basename "$test_dir"`
	pushd "$test_dir" > /dev/null
}

# returns to previous directory and removes artifacts directory
function end {
	artifacts_dir=${1:-"./dist"}

	rm -r "$artifacts_dir"
	popd > /dev/null
}

# compares two JSON files
function assert_json {
	actual="${1:?}"
	expected="${2:?}"

	json-diff "$expected" "$actual" || \
			fail "files \`$actual\` and \`$expected\` are not equivalent"
}

# compares two files
function assert_identical {
	actual="${1:?}"
	expected="${2:?}"

	# NB: `git diff` provides colorization (dependent on configuration)
	git diff --no-index "$expected" "$actual" || \
			fail "files \`$actual\` and \`$expected\` are not identical"
}

# ensures that the given file does not exist
function assert_missing {
	filepath="${1:?}"

	if [ -f "$filepath" ]; then
		fail "file \`$filepath\` should not exist"
	else
		true
	fi
}

# ensures the second file is smaller than the first file
function assert_smaller_size {
	original=$(wc -c < "${1:?}")
	result=$(wc -c < "${2:?}")

	if [ $(bc <<< "$result < $original") != 1 ]; then
		fail "file \`$2\` is not smaller than \`$1\`"
	else
		true
	fi
}

function fail {
	msg="${1:?}"

	echo; echo "FAILURE: $msg"
	false
}
