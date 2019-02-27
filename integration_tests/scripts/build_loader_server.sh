rm -rf ./loader_server
mkdir -p loader_server

cd ../web/hClient
npm run build

cd ../hLoader
parcel build ./index.html ./index.js
cp ./dist/* ../../integration_tests/loader_server

# cp ./dist/* ../../integration_tests/loader_server

# cd ../login
# npm run build
# cp ./dist/* ../../integration_tests/loader_server
