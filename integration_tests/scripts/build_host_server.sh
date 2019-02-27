mkdir -p host_server

cd ../web/hClient
npm run build
cp ./dist/* ../../integration_tests/host_server/
