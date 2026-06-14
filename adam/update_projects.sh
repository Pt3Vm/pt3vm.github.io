#!/bin/bash

# Konfiguracja
PROJECTS_DIR="projects"
IMG_DIR="img"
OUTPUT_FILE="projects.js"

# Wejdź do folderu skryptu
cd "$(dirname "$0")"

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

        # Sprawdzanie czy istnieje miniatura w folderze img
        if [ -f "$IMG_DIR/$id.png" ]; then
            thumbnail="$IMG_DIR/$id.png"
        else
            # Fallback do placeholdera, jeśli nie ma obrazka
            thumbnail="https://via.placeholder.com/300x200?text=$title"
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
        thumbnail: "$thumbnail"
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
