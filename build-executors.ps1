# Construir imágenes Docker para ejecutores de código

# Python
echo "Construyendo imagen de Python..."
docker build -t python-executor -f docker/executors/Dockerfile.python .

# Java
echo "Construyendo imagen de Java..."
docker build -t java-executor -f docker/executors/Dockerfile.java .

# C
echo "Construyendo imagen de C..."
docker build -t c-executor -f docker/executors/Dockerfile.c .

# C++
echo "Construyendo imagen de C++..."
docker build -t cpp-executor -f docker/executors/Dockerfile.cpp .

echo "Todas las imágenes construidas correctamente"
docker images | findstr executor