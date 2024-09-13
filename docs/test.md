sudo certbot --nginx -d d01.pirsani.id

Certificate is saved at: /etc/letsencrypt/live/d01.pirsani.id/fullchain.pem
Key is saved at: /etc/letsencrypt/live/d01.pirsani.id/privkey.pem

certbot install --cert-name d01.pirsani.id

sudo ln -s /etc/nginx/sites-available/d01.pirsani.id /etc/nginx/sites-enabled/

pm2 start pnpm --name d01 -- start -p 3030

sudo systemctl restart nginx

```
proxy_cache_path /var/cache/nginx/d01_pirsani levels=1:2 keys_zone=STATIC:10m inactive=7d use_temp_path=off;

upstream db01.pirsani_upstream {
    server 127.0.0.1:3030;
}

server {
        server_name d01.pirsani.id; # !!! - change to your domain name
        gzip on;
        gzip_proxied any;
        gzip_types application/javascript application/x-javascript text/css text/javascript;
        gzip_comp_level 5;
        gzip_buffers 16 8k;
        gzip_min_length 256;

    location /_next/static/ {
                proxy_cache STATIC;
                proxy_pass http://db01.pirsani_upstream;
                expires 60m;
                access_log off;
        }

    location / {
                proxy_pass http://db01.pirsani_upstream; # !!! - change to your app port
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'upgrade';
                proxy_set_header Host $host;
                proxy_cache_bypass $http_upgrade;
        }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/d01.pirsani.id/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/d01.pirsani.id/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot




}
server {
    if ($host = d01.pirsani.id) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    if ($host = d01.pirsani.id) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80;
    server_name d01.pirsani.id d01.pirsani.id;
    return 404; # managed by Certbot

}
```
