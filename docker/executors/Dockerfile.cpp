FROM gcc:latest

# Usuario sin privilegios
RUN useradd -m -u 1000 coderunner

WORKDIR /app

RUN chown coderunner:coderunner /app

USER coderunner

CMD g++ code.cpp -o programa && ./programa