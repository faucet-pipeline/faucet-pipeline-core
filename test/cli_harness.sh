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

# compares two files along with the corresponding source map
function assert_identical_sourcemap {
	actual="${1:?}"
	expected_src="${2:?}"
	expected_map="${3:?}"

	mv "$actual" "$actual.orig"
	# discard source map for source-only comparison
	sed '\!sourceMappingURL!d' < "$actual.orig" > "$actual"
	# limit source map to relevant properties (opaque, content-agnostic
	# comparison is not an option due to system-specific file paths)
	extract-sourcemap "$actual.orig" version names mappings sourcesContent > "$actual.map"

	assert_identical "$actual" "$expected_src"
	assert_json "$actual.map" "$expected_map"
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

function fail {
	msg="${1:?}"

	echo; echo "FAILURE: $msg"
	false
}

# compares two files and the inline source map
function assert_identical_sourcemap {
	actual="${1:?}"
	expected_src="${2:?}"
	expected_map="${3:?}"

	# save the original file
	mv "$actual" "$actual.orig"
	# drop the inline source map
	sed '\!sourceMappingURL!d' <"$actual.orig" >"$actual"
	# decode and clean the inline source map
	#  source maps contain system-dependent information (full paths)
	#  so we drop all information we're not explicitly testing
	extract-sourcemap "$actual.orig" version names mappings sourcesContent > "$actual.map"

	assert_identical "$actual" "$expected_src"
	assert_json "$actual.map" "$expected_map"
}

