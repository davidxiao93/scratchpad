
if $# -ne 3; then
    echo "Two arguments are expected. Target Width then target height"
    exit
fi

target="$1x$2"
mkdir $target

for file in *.png; do
    echo "Processing $file into $target"
    convert "$file" -resize "$target^" -gravity center -extent "$target+0+0" "$target/$file"    
done



