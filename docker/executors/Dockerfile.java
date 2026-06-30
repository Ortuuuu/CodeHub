FROM eclipse-temurin:17-jdk-alpine

# Usuario sin privilegios
RUN adduser -D -u 1000 coderunner

WORKDIR /app

# Cambiamos los permisos en /app para que el user coderunner pueda escribir en ella los archivos compilados
RUN chown coderunner:coderunner /app

USER coderunner

CMD javac Codigo.java && java Codigo