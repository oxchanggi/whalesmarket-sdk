for dir in packages/*; do
  if [ -d "$dir" ]; then
    echo "Building $dir..."
    (cd "$dir" && pnpm build)
  fi
done