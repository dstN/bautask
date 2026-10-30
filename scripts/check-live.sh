#!/bin/sh
# Checks the live site from outside after a deploy (after rntm.de/scripts/check-live.sh).
# Usage: scripts/check-live.sh https://bautask.yinside.de. Exits non-zero on the first failure.
set -eu
base="${1:?base url}"
host="${base#https://}"
fail() { echo "FAIL: $*" >&2; exit 1; }
# GET, as a browser asks: Plesk's nginx answers GET for the pages itself and skips .htaccess, HEAD goes through Apache
hdr() { curl -sS -D - -o /dev/null "$@" | tr -d '\r'; }
code() { curl -s -o /dev/null -w '%{http_code}' "$@"; }

echo "· headers on /"
for _ in 1 2 3 4 5 6; do [ "$(code "$base/")" = 200 ] && break; sleep 5; done
h=$(hdr "$base/")
printf '%s' "$h" | grep -qi '^HTTP/[0-9.]* 200' || fail "/ did not answer 200"
for name in "content-security-policy: .*style-src 'self' 'sha256-" "strict-transport-security" "x-content-type-options: nosniff" "referrer-policy: no-referrer" "permissions-policy" "x-frame-options: deny" "x-robots-tag: noindex"; do
  printf '%s' "$h" | grep -qi "^$name" || fail "missing header: $name"
done
printf '%s' "$h" | grep -qi "unsafe-inline" && fail "the CSP allows unsafe-inline"
printf '%s' "$h" | grep -qi "^set-cookie" && fail "a cookie is being set"
[ "$(printf '%s\n' "$h" | grep -ci '^strict-transport-security')" = 1 ] || fail "HSTS is sent more than once"

echo "· https only"
hdr "http://$host/" | grep -qi "^location: https://$host/" || fail "http:// does not redirect to https"

echo "· pages and the 404"
for p in /datenschutz/ /robots.txt /favicon.svg; do
  [ "$(code "$base$p")" = 200 ] || fail "$p did not answer 200"
done
[ "$(code "$base/gibt-es-nicht/")" = 404 ] || fail "an unknown path does not answer 404"
curl -s "$base/gibt-es-nicht/" | grep -q "Position nicht gefunden" || fail "the own 404 page is not served"
# netcup puts its own favicon.ico into a new document root, and the deploy only writes over it
curl -s "$base/favicon.ico" | cmp -s - "$(dirname "$0")/../public/favicon.ico" || fail "/favicon.ico is not the one from public/"

echo "· nothing private is reachable, no listings"
for p in /.htaccess /.git/HEAD /README.md /_astro/ /fonts/; do
  c=$(code "$base$p")
  case "$c" in 403|404) ;; *) fail "$p answered $c" ;; esac
done

echo "all live checks passed"
