# Obfuscate JavaScript
Docs_DIR="./docs"
JS_DIR="./docs/js"
CSS_DIR="./docs/css"
IMG_DIR="./docs/img"
HTML_DIR="./docs/html"
mkdir -p $Docs_DIR
cp ./manifest.json $Docs_DIR/
echo "Copy manifest.json completed."
mkdir -p $JS_DIR
for file in ./js/*.js
do
filename=$(basename $file)
terser "$file" --compress --mangle --output "$JS_DIR/$filename"
done
echo "JS Minification completed."
mkdir -p $CSS_DIR
for file in ./css/*.css
do
filename=$(basename $file)
cleancss -o "$CSS_DIR/$filename" $file
done
echo "CSS Minification completed."
mkdir -p $IMG_DIR
cp ./img/* $IMG_DIR/
echo "Copy images completed."
mkdir -p $HTML_DIR/
cp ./html/* $HTML_DIR/
echo "Copy html completed."
zip -r ./docs/install.zip $Docs_DIR/



# --- (install minify) ---
# sudo npm install -g javascript-obfuscator
# sudo npm install -g clean-css-cli
# --- (add execute permission) ---
# chmod +x minify.sh
# --- (run minify) ---
# ./minify.sh