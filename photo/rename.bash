i=1
for file in *.png; do
	mv "$file" "${i}.png"
	((i++))
done
