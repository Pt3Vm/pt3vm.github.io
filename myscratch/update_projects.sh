#!/bin/bash

# Folder z projektami i plik wyjściowy
PROJECTS_DIR="projects"
OUTPUT_FILE="projects.js"

# Wejdź do folderu myscratch, jeśli skrypt jest uruchamiany z poziomu wyżej
if [ -d "myscratch" ]; then
    cd myscratch
fi

echo "Skanowanie projektów w folderze $PROJECTS_DIR..."

# Rozpoczęcie pliku projects.js
echo "const projects = [" > "$OUTPUT_FILE"

FIRST=true

# Pętla po wszystkich plikach .html w folderze projects
for file in "$PROJECTS_DIR"/*.html; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        id="${filename%.*}"
        
        # Próba wyciągnięcia tytułu z tagu <title> w pliku HTML
        title=$(grep -oPi '(?<=<title>).*(?=</title>)' "$file" | head -1)
        
        # Jeśli nie znaleziono tytułu, użyj nazwy pliku
        if [ -z "$title" ]; then
            title="$id"
        fi

        # Dodaj przecinek, jeśli to nie jest pierwszy element
        if [ "$FIRST" = true ]; then
            FIRST=false
        else
            echo "," >> "$OUTPUT_FILE"
        fi

        # Dodaj obiekt projektu do pliku
        cat <<EOF >> "$OUTPUT_FILE"
    {
        id: "$id",
        title: "$title",
        description: "Projekt wyeksportowany z TurboWarp.",
        file: "projects/$filename",
        thumbnail: "https://via.placeholder.com/300x200?text=$title"
    }
EOF
    fi
done

# Zakończenie pliku
echo "" >> "$OUTPUT_FILE"
echo "];" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "// Skrypt automatycznie zaktualizował ten plik: $(date)" >> "$OUTPUT_FILE"

echo "Gotowe! Plik $OUTPUT_FILE został zaktualizowany."
