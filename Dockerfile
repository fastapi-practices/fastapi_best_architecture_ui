FROM guergeiro/pnpm:lts-latest-slim AS build

WORKDIR /fba_ui

COPY . .

RUN pnpm install \
    && pnpm build

FROM nginx

COPY scripts/deploy/nginx.conf /etc/nginx/nginx.conf

COPY --from=build /fba_ui/apps/web-antd/dist /var/www/fba_ui

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]