#!/bin/sh
set -e
DOMAIN=spansportshub.com
EMAIL=admin@spansportshub.com
WEBROOT_PATH=/var/www/certbot

if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
  certbot certonly --webroot -w $WEBROOT_PATH -d $DOMAIN --email $EMAIL --agree-tos --non-interactive --rsa-key-size 4096
else
  echo "Certificate already exists for $DOMAIN. Skipping."
fi 