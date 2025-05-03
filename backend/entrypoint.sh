#!/bin/sh

set -e

host="mysql"
until mysql -h "$host" -u root -p"$MYSQL_ROOT_PASSWORD" -e 'SELECT 1'; do
  >&2 echo "MySQL is unavailable - sleeping"
  sleep 1
done

>&2 echo "MySQL is up - executing command"
exec "$@"