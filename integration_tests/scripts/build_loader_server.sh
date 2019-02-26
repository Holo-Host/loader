mkdir -p loader_server
cp ../web/hLoader/* ./loader_server

cd ../web/hClient
npm run build
cp ./dist/* ../../integration_tests/loader_server

cd ../login
npm run build
cp ./dist/* ../../integration_tests/loader_server
